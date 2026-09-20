import unittest
import json
import os
from datetime import date, timedelta
from content import kind_for, validate, normalize, decode, caption, generate
from media import base, write, cards
from tempfile import TemporaryDirectory
from pathlib import Path
from unittest.mock import MagicMock, patch
from types import SimpleNamespace

EXAMPLE={'title':'A warmer thank-you','context':'Someone helped you.',
 'a':{'thai':'ขอบคุณ','roman':'khop khun','meaning':'Thank you.'},
 'b':{'thai':'ขอบคุณค่ะ','roman':'khop khun kha','meaning':'Thank you. (polite)'},
 'note':'Kha is commonly used by female speakers.',
 'distractors':['How much?','See you tomorrow.'],
 'paragraphs':['Someone helped you?','Add a polite ending to your thank-you.','Save this for your next conversation.'],
 'hashtags':['#BeamLearnThai','#LearnThai','#ThaiLanguage','#ThailandTravel','#EverydayThai']}

class Tests(unittest.TestCase):
    def review_response(self, payload):
        return SimpleNamespace(
            content=[SimpleNamespace(type='text',text=json.dumps(payload,ensure_ascii=False))],
            usage=SimpleNamespace(model_dump=lambda **_: {'input_tokens':10,'output_tokens':5}),
            stop_reason='end_turn',
        )

    def test_rejected_draft_gets_one_bounded_correction_review(self):
        corrected={**EXAMPLE,'a':{'thai':'มานั่งด้วยกันไหม','roman':'ma nang duay gan mai',
                                  'meaning':'Would you like to sit together?'}}
        invalid={**EXAMPLE,'a':{'thai':'มากั่งแกว่งกับฉันไหม','roman':'ma gung gaeng gab chan',
                                'meaning':'Will you sit and hang out with me?'}}
        responses=[
            self.review_response(invalid),
            self.review_response({'approved':False,'issues':['The Thai phrase is not natural.'],
                                  'lesson':corrected}),
            self.review_response({'approved':True,'issues':[]}),
        ]
        client=SimpleNamespace(messages=SimpleNamespace(create=MagicMock(side_effect=responses)))
        record=MagicMock()
        with patch.dict(os.environ,{'ANTHROPIC_API_KEY':'test-key'}), \
             patch('content.anthropic.Anthropic',return_value=client):
            result=generate('single',date(2026,9,20),[],record)
        self.assertEqual(result,corrected)
        self.assertEqual(client.messages.create.call_count,3)  # generate, review, one final review
        updates=[call.args[0] for call in record.update.call_args_list]
        self.assertTrue(any(update.get('reviewCorrectionStatus')=='approved' for update in updates))
        self.assertTrue(any(update.get('reviewCorrectionUsed') is True for update in updates))

    def test_corrected_draft_still_fails_closed_if_second_review_rejects(self):
        corrected={**EXAMPLE,'a':{'thai':'มานั่งด้วยกันไหม','roman':'ma nang duay gan mai',
                                  'meaning':'Would you like to sit together?'}}
        responses=[
            self.review_response(EXAMPLE),
            self.review_response({'approved':False,'issues':['Use a more natural phrase.'],
                                  'lesson':corrected}),
            self.review_response({'approved':False,'issues':['The phrase remains uncertain.']}),
        ]
        client=SimpleNamespace(messages=SimpleNamespace(create=MagicMock(side_effect=responses)))
        record=MagicMock()
        with patch.dict(os.environ,{'ANTHROPIC_API_KEY':'test-key'}), \
             patch('content.anthropic.Anthropic',return_value=client):
            with self.assertRaisesRegex(ValueError,'failed its second language review'):
                generate('single',date(2026,9,20),[],record)
        self.assertEqual(client.messages.create.call_count,3)
        updates=[call.args[0] for call in record.update.call_args_list]
        self.assertTrue(any(update.get('reviewCorrectionStatus')=='rejected_second_review' for update in updates))

    def test_mix_and_rotation(self):
        kinds=[kind_for(date(2026,9,7)+timedelta(days=i)) for i in range(21)]
        self.assertEqual(kinds.count('carousel'),12)
        self.assertEqual(kinds.count('single'),9)
        self.assertEqual(set(kinds),{'single','carousel'})
    def test_live_override_rejected(self):
        with self.assertRaises(ValueError):kind_for(date.today(),'reel',False)
    def test_ascii_and_bounds(self):
        validate(EXAMPLE)
        for value in ('Thai ค่ะ','x'*500):
            with self.assertRaises(ValueError):validate({**EXAMPLE,'title':value})
    def test_typography_not_transliteration(self):
        self.assertEqual(normalize('“Thai”'),'"Thai"')
        self.assertEqual(normalize('ค่ะ'),'ค่ะ')
        for thai in ('น้อยน้ำตาล','นะค่ะ','เช็คหน่อย'):
            with self.assertRaises(ValueError):
                validate({**EXAMPLE,'a':{**EXAMPLE['a'],'thai':thai}})
    def test_review_envelope(self):
        response=lambda s:SimpleNamespace(content=[SimpleNamespace(type='text',text=s)])
        self.assertEqual(decode(response('Review complete. {"approved":true,"issues":[]}'))['approved'],True)
        with self.assertRaises(ValueError):decode(response('{"approved":true,"issues":['))
    def test_render_and_overflow(self):
        with TemporaryDirectory() as d:
            self.assertEqual(len(cards('carousel',EXAMPLE,Path(d))),5)
            self.assertEqual(len(cards('single',EXAMPLE,Path(d))),1)
        with self.assertRaises(ValueError):
            write(base('Test','Test'),'x'*300,(0,0,100,100))
    def test_caption_is_mobile_formatted(self):
        value=caption(EXAMPLE)
        self.assertIn('\n\nWhy it works:\n',value)
        self.assertIn('\n\nTry it:\n',value)
        self.assertIn('\n\nRomanization note:\n',value)
        self.assertTrue(value.endswith(' '.join(EXAMPLE['hashtags'])))
    def test_dry_run_never_calls_publish(self):
        import publisher
        db=MagicMock();db.collection.return_value.order_by.return_value.limit.return_value.stream.return_value=[]
        buffer=MagicMock();buffer.channel_id='beam-only'
        buffer.get_channels.return_value=[{'id':'beam-only','service':'instagram'}]
        host=MagicMock();host.cleanup.return_value=0;host.upload.return_value='https://example.com/sample.png'
        with patch.dict('os.environ',{'DRY_RUN':'true','BEAM_FORMAT':'carousel'}), \
             patch.object(publisher.firestore,'Client',return_value=db), \
             patch.object(publisher,'BufferHandler',return_value=buffer), \
             patch.object(publisher,'generate',return_value=EXAMPLE), \
             patch.object(publisher,'render',return_value=[Path('sample.png')]), \
             patch.object(publisher,'MediaHost',return_value=host), \
             patch.object(publisher,'notify') as notify:
            self.assertEqual(publisher.run(),0)
            buffer.publish.assert_not_called()
            notify.assert_called_once()
    def test_existing_daily_claim_stops_ai(self):
        import publisher
        db=MagicMock()
        # Any legacy claim blocks cutover duplication before Claude is called.
        db.collection.return_value.document.return_value.get.return_value.exists=True
        with patch.dict('os.environ',{'DRY_RUN':'false','BEAM_FORMAT':''}), \
             patch.object(publisher.firestore,'Client',return_value=db), \
             patch.object(publisher,'BufferHandler'), \
             patch.object(publisher,'generate') as generate:
            self.assertEqual(publisher.run(),0)
            generate.assert_not_called()

if __name__=='__main__':unittest.main()
