import { Question } from './types'

export const ALL_QUESTIONS: Question[] = [
  // ── OPENNESS (12 total, 5 fellow-only) ──
  { id: 'o1', text: 'I enjoy exploring abstract ideas more than solving practical problems', axis: 'openness', reverse: false, fellowOnly: false },
  { id: 'o2', text: 'I prefer routine over novelty', axis: 'openness', reverse: true, fellowOnly: false },
  { id: 'o3', text: 'I am drawn to art, music, or creative expression even when it serves no purpose', axis: 'openness', reverse: false, fellowOnly: false },
  { id: 'o4', text: 'I often daydream about entirely different ways of living', axis: 'openness', reverse: false, fellowOnly: false },
  { id: 'o5', text: 'I prefer solutions that are proven over ones that are original', axis: 'openness', reverse: true, fellowOnly: false },
  { id: 'o6', text: 'I actively seek out experiences that challenge my worldview', axis: 'openness', reverse: false, fellowOnly: false },
  { id: 'o7', text: 'I get bored if I do the same thing for more than a few weeks', axis: 'openness', reverse: false, fellowOnly: false },
  { id: 'o8', text: 'I find beauty in things most people overlook', axis: 'openness', reverse: false, fellowOnly: true },
  { id: 'o9', text: 'I would rather read philosophy than watch a tutorial', axis: 'openness', reverse: false, fellowOnly: true },
  { id: 'o10', text: 'I trust my intuition more than conventional wisdom', axis: 'openness', reverse: false, fellowOnly: true },
  { id: 'o11', text: 'I enjoy not knowing what I think until I start talking or writing', axis: 'openness', reverse: false, fellowOnly: true },
  { id: 'o12', text: 'I would take a worse-paying job if it let me work on weirder things', axis: 'openness', reverse: false, fellowOnly: true },

  // ── CONSCIENTIOUSNESS (12 total, 5 fellow-only) ──
  { id: 'c1', text: 'I keep my living space organized', axis: 'conscientiousness', reverse: false, fellowOnly: false },
  { id: 'c2', text: 'I make plans and actually stick to them', axis: 'conscientiousness', reverse: false, fellowOnly: false },
  { id: 'c3', text: 'I often leave tasks unfinished when something more interesting comes along', axis: 'conscientiousness', reverse: true, fellowOnly: false },
  { id: 'c4', text: 'I pay attention to details even when nobody will notice', axis: 'conscientiousness', reverse: false, fellowOnly: false },
  { id: 'c5', text: 'I tend to procrastinate on important things', axis: 'conscientiousness', reverse: true, fellowOnly: false },
  { id: 'c6', text: 'When I say I will do something, I do it', axis: 'conscientiousness', reverse: false, fellowOnly: false },
  { id: 'c7', text: 'I work best with structure and deadlines', axis: 'conscientiousness', reverse: false, fellowOnly: false },
  { id: 'c8', text: 'My browser has more than 30 tabs open right now', axis: 'conscientiousness', reverse: true, fellowOnly: true },
  { id: 'c9', text: 'I have a system for tracking what I need to do', axis: 'conscientiousness', reverse: false, fellowOnly: true },
  { id: 'c10', text: 'I reply to messages within a few hours', axis: 'conscientiousness', reverse: false, fellowOnly: true },
  { id: 'c11', text: 'I can sit down and focus on one thing for hours without checking my phone', axis: 'conscientiousness', reverse: false, fellowOnly: true },
  { id: 'c12', text: 'If a project takes longer than expected, I usually push through rather than pivot', axis: 'conscientiousness', reverse: false, fellowOnly: true },

  // ── EXTRAVERSION (12 total, 5 fellow-only) ──
  { id: 'e1', text: 'I feel energized after spending time with a large group of people', axis: 'extraversion', reverse: false, fellowOnly: false },
  { id: 'e2', text: 'I prefer deep one-on-one conversations over parties', axis: 'extraversion', reverse: true, fellowOnly: false },
  { id: 'e3', text: 'I am usually the one to start conversations with strangers', axis: 'extraversion', reverse: false, fellowOnly: false },
  { id: 'e4', text: 'I need significant alone time to recharge', axis: 'extraversion', reverse: true, fellowOnly: false },
  { id: 'e5', text: 'I enjoy being the center of attention', axis: 'extraversion', reverse: false, fellowOnly: false },
  { id: 'e6', text: 'I think out loud rather than in my head', axis: 'extraversion', reverse: false, fellowOnly: false },
  { id: 'e7', text: 'I feel comfortable walking into a room where I know nobody', axis: 'extraversion', reverse: false, fellowOnly: false },
  { id: 'e8', text: 'I would rather text than call', axis: 'extraversion', reverse: true, fellowOnly: true },
  { id: 'e9', text: 'I get restless when I spend a whole day alone', axis: 'extraversion', reverse: false, fellowOnly: true },
  { id: 'e10', text: 'I have introduced myself to someone famous or important without hesitation', axis: 'extraversion', reverse: false, fellowOnly: true },
  { id: 'e11', text: 'At a dinner party I am more likely to listen than to dominate the conversation', axis: 'extraversion', reverse: true, fellowOnly: true },
  { id: 'e12', text: 'I can talk to anyone about anything for at least 10 minutes', axis: 'extraversion', reverse: false, fellowOnly: true },

  // ── AGREEABLENESS (12 total, 5 fellow-only) ──
  { id: 'a1', text: 'I go out of my way to make others feel comfortable', axis: 'agreeableness', reverse: false, fellowOnly: false },
  { id: 'a2', text: 'I tend to challenge people\'s ideas directly', axis: 'agreeableness', reverse: true, fellowOnly: false },
  { id: 'a3', text: 'I find it easy to forgive people who have wronged me', axis: 'agreeableness', reverse: false, fellowOnly: false },
  { id: 'a4', text: 'I prioritize group harmony over being right', axis: 'agreeableness', reverse: false, fellowOnly: false },
  { id: 'a5', text: 'I can be blunt even if it stings', axis: 'agreeableness', reverse: true, fellowOnly: false },
  { id: 'a6', text: 'I trust people until they give me a reason not to', axis: 'agreeableness', reverse: false, fellowOnly: false },
  { id: 'a7', text: 'I enjoy cooperating more than competing', axis: 'agreeableness', reverse: false, fellowOnly: false },
  { id: 'a8', text: 'I would rather be respected than liked', axis: 'agreeableness', reverse: true, fellowOnly: true },
  { id: 'a9', text: 'I avoid conflict even when I know I am right', axis: 'agreeableness', reverse: false, fellowOnly: true },
  { id: 'a10', text: 'I cry at movies or music more than I would admit', axis: 'agreeableness', reverse: false, fellowOnly: true },
  { id: 'a11', text: 'When someone asks for feedback I tell them what they need to hear, not what they want to hear', axis: 'agreeableness', reverse: true, fellowOnly: true },
  { id: 'a12', text: 'I believe most disagreements come from misunderstanding, not malice', axis: 'agreeableness', reverse: false, fellowOnly: true },

  // ── EMOTIONAL STABILITY (12 total, 5 fellow-only) ──
  { id: 's1', text: 'I often feel anxious about things that might go wrong', axis: 'stability', reverse: true, fellowOnly: false },
  { id: 's2', text: 'I bounce back quickly from setbacks', axis: 'stability', reverse: false, fellowOnly: false },
  { id: 's3', text: 'Small frustrations can ruin my entire day', axis: 'stability', reverse: true, fellowOnly: false },
  { id: 's4', text: 'I tend to overthink decisions long after making them', axis: 'stability', reverse: true, fellowOnly: false },
  { id: 's5', text: 'I stay calm under pressure even when others are panicking', axis: 'stability', reverse: false, fellowOnly: false },
  { id: 's6', text: 'My mood can shift dramatically within a single day', axis: 'stability', reverse: true, fellowOnly: false },
  { id: 's7', text: 'I worry about what others think of me', axis: 'stability', reverse: true, fellowOnly: false },
  { id: 's8', text: 'I have cried in the past week', axis: 'stability', reverse: true, fellowOnly: true },
  { id: 's9', text: 'I can receive harsh criticism without it affecting my self-worth', axis: 'stability', reverse: false, fellowOnly: true },
  { id: 's10', text: 'I have been told I am "too intense"', axis: 'stability', reverse: true, fellowOnly: true },
  { id: 's11', text: 'I feel emotionally steady most days', axis: 'stability', reverse: false, fellowOnly: true },
  { id: 's12', text: 'I sometimes spiral into worst-case-scenario thinking', axis: 'stability', reverse: true, fellowOnly: true },

  // ── DOOMER ↔ ACCELERATIONIST (12 total, 5 fellow-only) ──
  { id: 'd1', text: 'Advanced AI is more likely to destroy us than save us', axis: 'doomer_accel', reverse: true, fellowOnly: false },
  { id: 'd2', text: 'Technological progress should be slowed down until we understand the risks', axis: 'doomer_accel', reverse: true, fellowOnly: false },
  { id: 'd3', text: 'Humanity\'s best days are ahead of us, not behind us', axis: 'doomer_accel', reverse: false, fellowOnly: false },
  { id: 'd4', text: 'If I could press a button to create superintelligent AI right now, I would', axis: 'doomer_accel', reverse: false, fellowOnly: false },
  { id: 'd5', text: 'We need strict global regulations on AI development before it is too late', axis: 'doomer_accel', reverse: true, fellowOnly: false },
  { id: 'd6', text: 'The risk of not building AI fast enough is greater than building it too fast', axis: 'doomer_accel', reverse: false, fellowOnly: false },
  { id: 'd7', text: 'I sometimes lose sleep thinking about existential risk', axis: 'doomer_accel', reverse: true, fellowOnly: false },
  { id: 'd8', text: 'If we could merge with AI, I would do it', axis: 'doomer_accel', reverse: false, fellowOnly: true },
  { id: 'd9', text: 'I think p(doom) is above 50%', axis: 'doomer_accel', reverse: true, fellowOnly: true },
  { id: 'd10', text: 'The invention of the atomic bomb was net-positive for humanity', axis: 'doomer_accel', reverse: false, fellowOnly: true },
  { id: 'd11', text: 'I would volunteer for the first Mars colony even knowing I might die', axis: 'doomer_accel', reverse: false, fellowOnly: true },
  { id: 'd12', text: 'The precautionary principle does more harm than good', axis: 'doomer_accel', reverse: false, fellowOnly: true },

  // ── CHAOS ↔ ORDER (12 total, 5 fellow-only) ──
  { id: 'x1', text: 'Rules exist to be broken', axis: 'chaos_order', reverse: true, fellowOnly: false },
  { id: 'x2', text: 'I thrive in unpredictable environments', axis: 'chaos_order', reverse: true, fellowOnly: false },
  { id: 'x3', text: 'Most institutions serve their purpose well enough', axis: 'chaos_order', reverse: false, fellowOnly: false },
  { id: 'x4', text: 'The most interesting things happen when plans fall apart', axis: 'chaos_order', reverse: true, fellowOnly: false },
  { id: 'x5', text: 'I prefer knowing what to expect', axis: 'chaos_order', reverse: false, fellowOnly: false },
  { id: 'x6', text: 'I am drawn to people who are unpredictable and intense', axis: 'chaos_order', reverse: true, fellowOnly: false },
  { id: 'x7', text: 'The world needs more structure, not less', axis: 'chaos_order', reverse: false, fellowOnly: false },
  { id: 'x8', text: 'I have done something in the last month that scared me', axis: 'chaos_order', reverse: true, fellowOnly: true },
  { id: 'x9', text: 'I have been described as "chaotic" by more than one person', axis: 'chaos_order', reverse: true, fellowOnly: true },
  { id: 'x10', text: 'I follow traffic laws even when nobody is watching', axis: 'chaos_order', reverse: false, fellowOnly: true },
  { id: 'x11', text: 'I think the best art comes from breaking conventions', axis: 'chaos_order', reverse: true, fellowOnly: true },
  { id: 'x12', text: 'Anarchy would be fun for about 48 hours', axis: 'chaos_order', reverse: true, fellowOnly: true },
]

export const PUBLIC_QUESTIONS = ALL_QUESTIONS.filter(q => !q.fellowOnly)
export const FELLOW_QUESTIONS = ALL_QUESTIONS
