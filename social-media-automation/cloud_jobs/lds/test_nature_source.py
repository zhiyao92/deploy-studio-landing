import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import MagicMock, patch
from nature_source import download

class NatureDownloadTests(unittest.TestCase):
    def test_download_uses_bounded_but_realistic_transfer_budget(self):
        response=MagicMock(status_code=200,headers={'Content-Length':'4'})
        response.__enter__.return_value=response
        response.iter_content.return_value=[b'data']
        with TemporaryDirectory() as temp,patch('nature_source.requests.get',return_value=response) as get:
            target=Path(temp)/'clip.mp4'
            download('https://videos.pexels.com/video-files/example.mp4',target)
            self.assertEqual(target.read_bytes(),b'data')
            self.assertEqual(get.call_args.kwargs['timeout'],(10,60))

    def test_rejects_oversized_video_from_content_length(self):
        response=MagicMock(status_code=200,headers={'Content-Length':str(91*1024*1024)})
        response.__enter__.return_value=response
        with TemporaryDirectory() as temp,patch('nature_source.requests.get',return_value=response):
            with self.assertRaisesRegex(RuntimeError,'90 MiB size cap'):
                download('https://videos.pexels.com/video-files/example.mp4',Path(temp)/'clip.mp4')

if __name__=='__main__':unittest.main()
