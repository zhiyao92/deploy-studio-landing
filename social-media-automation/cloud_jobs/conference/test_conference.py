import unittest
from datetime import date,timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import MagicMock,patch
from content import kind_for,validate,decode,normalize,caption
from media import card
from nature import download

EXAMPLE={'slides':['Your week is already full.'],'paragraphs':['A full calendar can hide our real priorities.','This talk invites us to choose what strengthens faith and family.','Choose one priority today.'],'question':'What helps you protect time for what matters?','hashtags':['#GeneralConference','#ConferenceStudy','#FaithInChrist','#ComeUntoChrist','#LatterDaySaints']}

class Tests(unittest.TestCase):
    def test_weekly_mix(self):
        kinds=[kind_for(date(2026,9,7)+timedelta(days=i)) for i in range(7)]
        self.assertEqual(kinds.count('carousel'),3);self.assertEqual(kinds.count('reel'),2);self.assertEqual(kinds.count('single'),2)
    def test_live_override_blocked(self):
        with self.assertRaises(ValueError):kind_for(date.today(),'reel',False)
    def test_content_validation(self):
        validate(EXAMPLE,'single')
        with self.assertRaises(ValueError):validate({**EXAMPLE,'slides':['“A quote” appears here.']},'single')
    def test_long_question_is_shortened_instead_of_failing(self):
        data={**EXAMPLE,'question':'Who in your family or circle is on a different faith journey, and how might patient love keep you connected while respecting their choices?'}
        normalized=normalize(data,'single')
        self.assertEqual(normalized['question'],'Who in your family or circle is on a different faith journey?')
        self.assertLessEqual(len(normalized['question']),120)
        validate(normalized,'single')
    def test_missing_question_gets_safe_fallback(self):
        normalized=normalize({**EXAMPLE,'question':''},'single')
        self.assertEqual(normalized['question'],'What is one way to put this teaching into practice today?')
        validate(normalized,'single')
    def test_extra_caption_question_is_removed_without_breaking_three_paragraphs(self):
        data={**EXAMPLE,'question':None,'paragraphs':[
          'The week feels full. We can still choose what matters.',
          'Elder Oaks teaches that some good choices are better than others.',
          'Protect one small moment for your family today.',
          "What's competing for your family's best time this week?"],
          'slides':['We are pulled in many directions.','Some good choices matter more.',
            'Protect one moment for family.','Choose one priority today.']}
        normalized=normalize(data,'reel')
        self.assertEqual(len(normalized['paragraphs']),3)
        self.assertTrue(all('?' not in paragraph for paragraph in normalized['paragraphs']))
        validate(normalized,'reel')
    def test_single_normalizes_extra_slide_ideas(self):
        data={**EXAMPLE,'slides':['Choose what matters most today.','Unused second idea stays out.'],
          'question':'What helps you protect time for what matters',
          'paragraphs':['Are you busy? Most of us are.','Choose the "good" thing.','Act today. What helps you protect time for what matters']}
        normalized=normalize(data,'single')
        self.assertEqual(normalized['slides'],['Choose what matters most today.'])
        self.assertEqual(normalized['question'],'What helps you protect time for what matters?')
        self.assertEqual(normalized['paragraphs'],['Most of us are.','Choose the good thing.','Act today.'])
    def test_parser_accepts_envelope_and_rejects_truncation(self):
        obj=lambda value:SimpleNamespace(content=[SimpleNamespace(type='text',text=value)])
        self.assertEqual(decode(obj('Result: {"ok":true}'))['ok'],True)
        self.assertEqual(decode(obj('```json\n{"slides":["One",],"question":"Why?",}\n```')),
          {'slides':['One'],'question':'Why?'})
        with self.assertRaises(Exception):decode(obj('{"ok":'))
    def test_card_render(self):
        with TemporaryDirectory() as temp:
            path=card(EXAMPLE['slides'][0],Path(temp)/'card.png')
            self.assertGreater(path.stat().st_size,1000)
    def test_pexels_download_uses_bounded_but_realistic_transfer_budget(self):
        response=MagicMock(status_code=200,headers={'Content-Length':'4'})
        response.__enter__.return_value=response;response.iter_content.return_value=[b'data']
        with TemporaryDirectory() as temp,patch('nature.requests.get',return_value=response) as get:
            target=Path(temp)/'clip.mp4';download('https://videos.pexels.com/video-files/example.mp4',target)
            self.assertEqual(target.read_bytes(),b'data')
            self.assertEqual(get.call_args.kwargs['timeout'],(10,60))
    def test_pexels_download_rejects_oversized_file_from_header(self):
        response=MagicMock(status_code=200,headers={'Content-Length':str(91*1024*1024)})
        response.__enter__.return_value=response
        with TemporaryDirectory() as temp,patch('nature.requests.get',return_value=response):
            with self.assertRaisesRegex(RuntimeError,'90 MiB size cap'):
                download('https://videos.pexels.com/video-files/example.mp4',Path(temp)/'clip.mp4')
    def test_caption_is_mobile_formatted(self):
        source={'title':'Good, Better, Best','speaker':'Elder Dallin H. Oaks',
          'conference':'October 2007','url':'https://www.churchofjesuschrist.org/study/general-conference/2007/10/good-better-best?lang=eng'}
        value=caption(EXAMPLE,source)
        self.assertIn('\n\nFrom the message:\n',value)
        self.assertIn('\n\nTry this:\n',value)
        self.assertIn('\n\nA question to reflect on:\n',value)
        self.assertIn('\n\nSource:\n',value)
        self.assertTrue(value.endswith(' '.join(EXAMPLE['hashtags'])))
    def test_dry_run_never_calls_buffer_publish(self):
        import publisher
        db=MagicMock();buffer=MagicMock();buffer.channel_id='conference-only'
        buffer.get_channels.return_value=[{'id':'conference-only','service':'instagram'}]
        host=MagicMock();host.cleanup.return_value=0;host.upload.return_value='https://example.com/card.png'
        source={'url':'https://www.churchofjesuschrist.org/study/general-conference/2007/10/good-better-best?lang=eng',
          'title':'Good, Better, Best','speaker':'Elder Dallin H. Oaks','conference':'October 2007','transcript':'x'*2000}
        with patch.dict('os.environ',{'DRY_RUN':'true','CONFERENCE_FORMAT':'single','CONFERENCE_SOURCE_URL':source['url'],'PUBLISHER_IMAGE':'test',
             'BUFFER_ACCESS_TOKEN':'test','BUFFER_CHANNEL_ID':'test','SLACK_WEBHOOK_URL':'test','GITHUB_TOKEN':'test',
             'GITHUB_MEDIA_REPO':'test/repo','MEDIA_BUCKET':'test','ANTHROPIC_API_KEY':'test'}), \
             patch.object(publisher.firestore,'Client',return_value=db),patch.object(publisher,'BufferHandler',return_value=buffer), \
             patch.object(publisher,'fetch',return_value=source),patch.object(publisher,'generate',return_value=EXAMPLE), \
             patch.object(publisher,'render',return_value=[Path('card.png')]),patch.object(publisher,'MediaHost',return_value=host), \
             patch.object(publisher,'notify') as notify:
            self.assertEqual(publisher.run(),0)
            buffer.publish.assert_not_called();notify.assert_called_once()

if __name__=='__main__':unittest.main()
