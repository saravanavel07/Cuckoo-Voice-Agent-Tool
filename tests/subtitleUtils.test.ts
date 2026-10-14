import {
  formatTimeSRT,
  formatTimeVTT,
  formatTimeDisplay,
  generateSRT,
  generateVTT,
} from '../src/utils/subtitleUtils';
import { SubtitleSegment } from '../src/types';

function runTests() {
  console.log('[TEST] Starting Subtitle Utils Tests...');

  // 1. Test SRT formatting
  const srtTime = formatTimeSRT(65.432);
  if (srtTime !== '00:01:05,432') {
    throw new Error(`SRT time formatting failed: expected "00:01:05,432", got "${srtTime}"`);
  }
  console.log('✓ SRT Time formatting passed');

  // 2. Test VTT formatting
  const vttTime = formatTimeVTT(65.432);
  if (vttTime !== '00:01:05.432') {
    throw new Error(`VTT time formatting failed: expected "00:01:05.432", got "${vttTime}"`);
  }
  console.log('✓ VTT Time formatting passed');

  // 3. Test Display formatting
  const displayTime = formatTimeDisplay(125);
  if (displayTime !== '2:05') {
    throw new Error(`Display time formatting failed: expected "2:05", got "${displayTime}"`);
  }
  console.log('✓ Display Time formatting passed');

  // 4. Test Segment SRT generation with Tamil text
  const segments: SubtitleSegment[] = [
    {
      id: 'seg-1',
      start: 0.0,
      end: 2.5,
      speaker: 'Speaker 1',
      text: 'வணக்கம், Cuckoo Voice AI க்கு வரவேற்கிறோம்.',
      confidence: 0.98,
    },
    {
      id: 'seg-2',
      start: 3.0,
      end: 6.2,
      speaker: 'Speaker 2',
      text: 'Speech recognized with millisecond accuracy.',
      confidence: 0.97,
    },
  ];

  const srtOutput = generateSRT(segments);
  if (!srtOutput.includes('00:00:00,000 --> 00:00:02,500') || !srtOutput.includes('வணக்கம்')) {
    throw new Error(`SRT generation failed for segments: ${srtOutput}`);
  }
  console.log('✓ SRT Segment generation passed with Tamil Unicode support');

  // 5. Test VTT Segment generation
  const vttOutput = generateVTT(segments);
  if (!vttOutput.startsWith('WEBVTT') || !vttOutput.includes('00:00:03.000 --> 00:00:06.200')) {
    throw new Error(`VTT generation failed for segments: ${vttOutput}`);
  }
  console.log('✓ VTT Segment generation passed');

  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests();
