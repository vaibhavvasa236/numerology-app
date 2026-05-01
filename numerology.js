// ── Pythagorean chart: A=1 … I=9, J=1 … R=9, S=1 … Z=8
const PYTHAGOREAN = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
};

// ── Chaldean chart: 1-8 only (9 is sacred, unassigned)
const CHALDEAN = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,
  J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,
  S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
};

const VOWELS = new Set(['A','E','I','O','U']);

function reduceToSingle(n, keepMaster = true) {
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
  }
  return n;
}

function sumLetters(name, chart) {
  return name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((s, c) => s + (chart[c] || 0), 0);
}

// ── Pythagorean
export function pythagorean(name, dob) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  const letters = clean.split('');

  const expressionRaw = letters.reduce((s, c) => s + (PYTHAGOREAN[c] || 0), 0);
  const soulRaw = letters.filter(c => VOWELS.has(c)).reduce((s, c) => s + (PYTHAGOREAN[c] || 0), 0);
  const personalityRaw = letters.filter(c => !VOWELS.has(c)).reduce((s, c) => s + (PYTHAGOREAN[c] || 0), 0);

  // Life path from full date digits
  const digits = dob.replace(/\D/g, '');
  const lifePathRaw = digits.split('').reduce((s, d) => s + parseInt(d), 0);

  return {
    expression:  { raw: expressionRaw,   reduced: reduceToSingle(expressionRaw) },
    soulUrge:    { raw: soulRaw,          reduced: reduceToSingle(soulRaw) },
    personality: { raw: personalityRaw,   reduced: reduceToSingle(personalityRaw) },
    lifePath:    { raw: lifePathRaw,      reduced: reduceToSingle(lifePathRaw) },
    letterMap: letters.map(c => ({ letter: c, value: PYTHAGOREAN[c] || 0, isVowel: VOWELS.has(c) }))
  };
}

// ── Chaldean
export function chaldean(name, dob) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  const letters = clean.split('');

  const nameRaw = letters.reduce((s, c) => s + (CHALDEAN[c] || 0), 0);
  const digits = dob.replace(/\D/g, '');
  const dobRaw = digits.split('').reduce((s, d) => s + parseInt(d), 0);
  const combinedRaw = nameRaw + dobRaw;

  return {
    name:     { compound: nameRaw,     single: reduceToSingle(nameRaw, false) },
    dob:      { compound: dobRaw,      single: reduceToSingle(dobRaw, false) },
    combined: { compound: combinedRaw, single: reduceToSingle(combinedRaw, false) },
    letterMap: letters.map(c => ({ letter: c, value: CHALDEAN[c] || 0 }))
  };
}

// ── Lo Shu Grid
// Standard layout:
//  4 | 9 | 2
//  3 | 5 | 7
//  8 | 1 | 6
const LOSHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

const LOSHU_MEANINGS = {
  1: { planet: 'Moon',    trait: 'Communication, intuition, emotional intelligence' },
  2: { planet: 'Pluto',   trait: 'Sensitivity, cooperation, diplomacy' },
  3: { planet: 'Jupiter', trait: 'Creativity, expression, optimism' },
  4: { planet: 'Rahu',    trait: 'Practicality, hard work, discipline' },
  5: { planet: 'Mercury', trait: 'Balance, adaptability, freedom' },
  6: { planet: 'Venus',   trait: 'Nurturing, responsibility, love' },
  7: { planet: 'Ketu',    trait: 'Spirituality, introspection, wisdom' },
  8: { planet: 'Saturn',  trait: 'Ambition, authority, material success' },
  9: { planet: 'Mars',    trait: 'Humanitarianism, idealism, courage' }
};

export function loShu(dob) {
  const digits = dob.replace(/\D/g, '').split('').map(Number).filter(d => d !== 0);
  const counts = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;
  digits.forEach(d => { if (d >= 1 && d <= 9) counts[d]++; });

  const present = Object.keys(counts).filter(k => counts[k] > 0).map(Number);
  const missing = Object.keys(counts).filter(k => counts[k] === 0).map(Number);

  return { layout: LOSHU_LAYOUT, counts, present, missing, meanings: LOSHU_MEANINGS };
}

// ── Number meanings for result panels
export const NUMBER_MEANINGS = {
  1:  'Leadership, independence, originality, pioneering spirit.',
  2:  'Cooperation, sensitivity, balance, partnerships.',
  3:  'Creativity, self-expression, joy, communication.',
  4:  'Stability, practicality, hard work, reliability.',
  5:  'Freedom, adventure, change, versatility.',
  6:  'Responsibility, nurturing, harmony, family.',
  7:  'Spirituality, introspection, analysis, wisdom.',
  8:  'Ambition, authority, material success, power.',
  9:  'Humanitarianism, idealism, compassion, completion.',
  11: 'Master Number — Intuition, spiritual insight, enlightenment.',
  22: 'Master Number — Master Builder, turning dreams into reality.',
  33: 'Master Number — Master Teacher, selfless service, healing.'
};

// ── Chaldean Predictions
export const CHALDEAN_PREDICTIONS = {
  name: {
    1: { title: 'The Pioneer', text: 'Your name carries the energy of a born leader. You are driven, self-reliant, and original in thought. You are likely to start new ventures and inspire others around you. Success comes when you trust your instincts and take bold action.' },
    2: { title: 'The Diplomat', text: 'Your name vibrates with the energy of cooperation and sensitivity. You excel in partnerships and are a natural peacemaker. You have deep intuition and the gift of understanding others. Success comes through collaboration rather than solo efforts.' },
    3: { title: 'The Creator', text: 'Your name radiates creative expression and joy. You are gifted in communication, arts, and social interaction. People are naturally drawn to your optimistic energy. Your path to success lies in sharing your creative gifts with the world.' },
    4: { title: 'The Builder', text: 'Your name carries steady, disciplined energy. You are reliable, methodical, and hardworking. You build lasting foundations and are trusted by those around you. Material success comes through persistent effort and structured planning.' },
    5: { title: 'The Explorer', text: 'Your name vibrates with freedom and change. You are adventurous, versatile, and quick-witted. You thrive when given variety and resist routine. Your life will involve travel, diverse experiences, and constant evolution.' },
    6: { title: 'The Nurturer', text: 'Your name carries the energy of love and responsibility. You are deeply caring, family-oriented, and service-driven. Others look to you for guidance and comfort. Your greatest fulfillment comes through nurturing and supporting those you love.' },
    7: { title: 'The Seeker', text: 'Your name vibrates with spiritual depth and analytical power. You are introspective, philosophical, and drawn to hidden truths. You need solitude to recharge. Your path leads to mastery through deep study and inner wisdom.' },
    8: { title: 'The Achiever', text: 'Your name carries immense material power. You are ambitious, authoritative, and driven to succeed on a large scale. You are naturally drawn to business, finance, and leadership roles. Wealth and status are within your reach when you stay disciplined.' },
    9: { title: 'The Humanitarian', text: 'Your name vibrates with universal love and selfless service. You are compassionate, idealistic, and globally minded. You feel a deep calling to make the world better. Your greatest fulfillment comes from giving without expectation of return.' }
  },
  dob: {
    1: { title: 'Soul of a Leader', text: 'Your birth date marks you as someone destined to lead and initiate. You carry natural authority and others follow your direction instinctively. Life will repeatedly place you in positions of independence and decision-making.' },
    2: { title: 'Soul of a Mediator', text: 'Your birth date gives you a sensitive, empathetic soul. You are drawn to harmony and balance in all relationships. Life will teach you through partnerships and the art of listening. You have a quiet but powerful influence on those around you.' },
    3: { title: 'Soul of an Artist', text: 'Your birth date infuses your life with creative enthusiasm. You are joyful, expressive, and socially vibrant. Life brings opportunities in communication, performance, and creative fields. Your energy uplifts everyone you meet.' },
    4: { title: 'Soul of a Planner', text: 'Your birth date gives you a grounded, disciplined soul. You approach life with patience and structure. You are the dependable one in any group. Life rewards your consistent efforts with solid, lasting achievements.' },
    5: { title: 'Soul of an Adventurer', text: 'Your birth date makes you restless and freedom-loving. Change is not your enemy — it is your greatest teacher. Life will bring constant variety, travel, and new experiences. You inspire others to break free of limitations.' },
    6: { title: 'Soul of a Healer', text: 'Your birth date calls you to serve and protect. You carry deep love for family and community. Life consistently draws you toward roles of care, teaching, and healing. Your presence brings warmth and stability to those around you.' },
    7: { title: 'Soul of a Mystic', text: 'Your birth date gives you a deeply reflective, spiritual soul. You are naturally drawn to philosophy, metaphysics, and the unseen realms. Life brings periods of solitude that become your greatest source of wisdom.' },
    8: { title: 'Soul of an Executive', text: 'Your birth date carries the vibration of power and abundance. You are here to achieve big things in the material world. Life will test your integrity and reward your ambition. Financial success and leadership are core themes of your journey.' },
    9: { title: 'Soul of a Sage', text: 'Your birth date marks a life of completion, wisdom, and service. You carry the energy of all numbers and feel a connection to humanity at large. Life calls you to let go of the personal and embrace the universal.' }
  },
  combined: {
    1: { title: 'Destiny of Independence', text: 'Your combined energy points to a life of self-made success. You will forge your own path and become a trailblazer in your field. Relationships thrive when you maintain your independence within them.' },
    2: { title: 'Destiny of Partnership', text: 'Your combined energy draws you toward meaningful collaboration. Your greatest achievements will come through working closely with others. Intuition is your superpower — trust it in both personal and professional choices.' },
    3: { title: 'Destiny of Expression', text: 'Your combined energy is vibrant and creative. You are meant to communicate, inspire, and entertain. Whether through writing, speaking, music, or art, sharing your voice is your greatest destiny.' },
    4: { title: 'Destiny of Foundation', text: 'Your combined energy calls you to build something lasting. You have the capacity to create structures — businesses, families, or institutions — that outlive you. Hard work today leads to an enduring legacy tomorrow.' },
    5: { title: 'Destiny of Freedom', text: 'Your combined energy resists confinement. You are here to experience life fully and help others embrace change. Careers in media, travel, sales, or entrepreneurship align perfectly with your vibrant destiny.' },
    6: { title: 'Destiny of Service', text: 'Your combined energy is magnetic and nurturing. You are destined to be a pillar of support in your family and community. Professions in healing, counselling, education, or the arts bring your highest fulfillment.' },
    7: { title: 'Destiny of Wisdom', text: 'Your combined energy is deeply spiritual and analytical. You are destined to become an expert in your chosen field through deep study and quiet reflection. Teaching or research will bring your greatest accomplishments.' },
    8: { title: 'Destiny of Power', text: 'Your combined energy is one of the most financially potent in numerology. You are destined for material success and executive influence. Stay true to ethical principles and your ambition will build an impressive empire.' },
    9: { title: 'Destiny of Legacy', text: 'Your combined energy is universal and compassionate. You are here to leave the world better than you found it. Whether through philanthropy, art, or leadership, your legacy will touch many lives across generations.' }
  }
};

// ── Pythagorean Predictions
export const PYTHAGOREAN_PREDICTIONS = {
  lifePath: {
    1:  { title: 'The Leader', text: 'You are here to lead with confidence and originality. Life constantly pushes you to stand on your own two feet and make independent decisions. Your greatest growth comes when you overcome self-doubt and embrace your natural authority. Careers in entrepreneurship, management, and innovation suit you best.' },
    2:  { title: 'The Peacemaker', text: 'Your life purpose is to bring harmony, balance, and cooperation wherever you go. You are gifted with sensitivity and deep intuition. Your path involves navigating relationships and learning that your quiet influence is just as powerful as any loud authority. You thrive in counselling, diplomacy, and healing arts.' },
    3:  { title: 'The Communicator', text: 'Your life purpose is to express, inspire, and uplift. You have a natural gift for words, creativity, and bringing joy to others. Life asks you to develop discipline around your many talents and share them generously. Careers in writing, entertainment, teaching, and the arts are your domain.' },
    4:  { title: 'The Foundation Builder', text: 'Your life purpose is to create order, security, and lasting structures. You are disciplined, reliable, and deeply practical. Life will teach you patience and the value of steady effort over shortcuts. You excel in engineering, finance, law, and any field requiring attention to detail.' },
    5:  { title: 'The Freedom Seeker', text: 'Your life purpose is to experience the full breadth of human existence and inspire others to embrace change. You are adaptable, resourceful, and magnetic. Life asks you to master freedom without becoming irresponsible. Travel, media, sales, and entrepreneurship are your natural arenas.' },
    6:  { title: 'The Caretaker', text: 'Your life purpose is to serve, nurture, and heal your community. You carry an immense sense of responsibility toward those you love. Life teaches you to give without losing yourself. Healing, education, counselling, interior design, and family-oriented work fulfill your soul.' },
    7:  { title: 'The Truth Seeker', text: 'Your life purpose is to go beneath the surface of reality and uncover deeper truths. You are analytical, spiritual, and deeply introspective. Life gives you solitude as a gift, not a punishment. Research, science, philosophy, spirituality, and psychology are your natural callings.' },
    8:  { title: 'The Powerhouse', text: 'Your life purpose is to achieve mastery in the material world and use your power to uplift others. You are ambitious, resilient, and business-minded. Life will test your relationship with money and power. When balanced with integrity, you are destined for great wealth and lasting influence.' },
    9:  { title: 'The Humanitarian', text: 'Your life purpose is to serve humanity with compassion and wisdom. You have lived many experiences and carry deep understanding. Life asks you to release the personal and embrace the universal. Art, healing, social work, and global causes are where you leave your greatest mark.' },
    11: { title: 'The Inspired Visionary', text: 'As a Master Number 11, you carry extraordinary intuitive and spiritual power. You are a channel for higher wisdom and inspiration. Life asks you to overcome deep-seated anxiety and self-doubt to step into your role as a spiritual messenger. Your impact on others can be profound and life-changing.' },
    22: { title: 'The Master Builder', text: 'As a Master Number 22, you possess the vision of an 11 combined with the practical power of a 4. You are born to build extraordinary things that benefit humanity on a large scale. Life demands discipline and responsibility in equal measure to your grand ambitions.' },
    33: { title: 'The Master Teacher', text: 'As a Master Number 33, you carry the highest vibration of love and selfless service. You are here to uplift and heal on a global level. Life asks complete dedication to others before self. Your compassion, wisdom, and creative power can transform communities and inspire generations.' }
  },
  expression: {
    1:  { title: 'Born to Lead', text: 'Your talents are uniquely suited to pioneering new ideas and leading others. You are inventive and thrive when given autonomy. Careers where you can direct, innovate, and act independently will bring your greatest achievements.' },
    2:  { title: 'Born to Collaborate', text: 'Your talents shine brightest in partnership and support roles. You have an extraordinary ability to bring people together and sense unspoken needs. You excel as a mediator, counsellor, or in any role requiring emotional intelligence.' },
    3:  { title: 'Born to Inspire', text: 'Your talents lie in communication and creative expression. You have a magnetic personality and a gift for making complex things feel simple and joyful. Performing arts, writing, speaking, and teaching are where you shine.' },
    4:  { title: 'Born to Build', text: 'Your talents are rooted in practicality, discipline, and precise execution. You build what others only dream of. Engineering, architecture, accounting, law, and management are fields where your meticulous nature creates lasting value.' },
    5:  { title: 'Born to Explore', text: 'Your talents are versatile and magnetic. You can do many things well and adapt to any environment. Sales, marketing, travel, media, and entrepreneurship allow your restless energy to flourish and your natural persuasiveness to shine.' },
    6:  { title: 'Born to Heal', text: 'Your talents are centered around responsibility, beauty, and care. You have a natural gift for creating harmony in spaces and relationships. Medicine, nutrition, design, education, and social work are fields where your nurturing nature creates the most impact.' },
    7:  { title: 'Born to Discover', text: 'Your talents lie in deep analysis, research, and spiritual inquiry. You see patterns that others miss. Science, psychology, philosophy, writing, and spiritual teaching are where your quiet brilliance produces extraordinary results.' },
    8:  { title: 'Born to Succeed', text: 'Your talents are executive and entrepreneurial. You understand how systems, money, and power work. Business, finance, real estate, and large-scale management are where your commanding presence and strategic mind build empires.' },
    9:  { title: 'Born to Serve', text: 'Your talents are universal and compassionate. You have broad knowledge, deep empathy, and a magnetic wisdom that draws others to you. Teaching, philanthropy, healing arts, and global humanitarian work are where your gifts create the deepest impact.' },
    11: { title: 'Born to Illuminate', text: 'Your talents are visionary and spiritually charged. You inspire others simply by being authentic. Spiritual guidance, the arts, psychology, and public speaking are arenas where your elevated frequency can shift the consciousness of those around you.' },
    22: { title: 'Born to Transform', text: 'Your talents are extraordinary in scale. You can conceive and execute projects that reshape communities. Architecture, global enterprise, politics, and large-scale humanitarian initiatives are where your Master Builder energy leaves an unforgettable legacy.' },
    33: { title: 'Born to Uplift', text: 'Your talents are devoted entirely to healing and teaching humanity. You carry a rare ability to transmute suffering into wisdom and inspire others toward their highest potential. Your life itself becomes the greatest teaching.' }
  },
  soulUrge: {
    1:  'Deep inside, you crave independence and the freedom to do things your own way. Your soul yearns to be first — the initiator, the pioneer. You feel most alive when you are charting new territory on your own terms.',
    2:  'At your core, you desire love, harmony, and deep connection. Your soul yearns for true partnership where you feel seen and understood. Conflict unsettles you greatly; peace and mutual support are what your heart truly needs.',
    3:  'Deep inside, you desire to express yourself fully and be appreciated for your creativity. Your soul yearns for joy, laughter, and meaningful self-expression. You feel most alive when you are creating, communicating, or entertaining.',
    4:  'At your core, you crave security, order, and a sense of purpose built through hard work. Your soul needs to feel useful and productive. You feel most alive when you have a solid plan and the discipline to see it through.',
    5:  'Deep inside, you crave freedom, adventure, and constant stimulation. Your soul yearns to experience the full range of human experience. Routine feels like a cage. You feel most alive when exploring new horizons.',
    6:  'At your core, you desire to love and be loved unconditionally. Your soul yearns to create a warm, harmonious home and feel truly needed by those you care for. Service and devotion bring you the deepest inner peace.',
    7:  'Deep inside, you crave understanding, solitude, and spiritual depth. Your soul yearns to know the hidden truth behind existence. You feel most alive during moments of quiet contemplation and when your inner wisdom is recognized.',
    8:  'At your core, you desire abundance, achievement, and recognition for your competence. Your soul yearns to exercise power and build something of lasting significance. You feel most alive when you are succeeding on a grand scale.',
    9:  'Deep inside, you crave a world filled with compassion, justice, and beauty. Your soul yearns to make a meaningful difference. You feel most alive when you are serving a cause greater than yourself.',
    11: 'At your deepest core, you yearn for spiritual connection and a sense of divine purpose. Your soul desires to be a vessel for higher wisdom. You feel most alive when you are inspiring others through your unique intuitive gifts.',
    22: 'Deep inside, you crave the opportunity to build something monumental that serves humanity. Your soul is not satisfied with small dreams. You feel most alive when your work has global significance and practical impact at scale.',
    33: 'At your deepest core, you yearn to love without limits and heal without judgment. Your soul desires to be a teacher of unconditional love. You feel most alive when you are lifting others out of pain and into their highest potential.'
  },
  personality: {
    1:  'To the outside world, you appear confident, assertive, and self-sufficient. Others see you as a natural leader and an independent spirit. You project an aura of authority that commands respect even before you speak.',
    2:  'To the outside world, you appear gentle, thoughtful, and diplomatic. Others see you as a considerate, trustworthy person who listens carefully. You project warmth and approachability, making others feel instantly comfortable.',
    3:  'To the outside world, you appear charming, enthusiastic, and creative. Others see you as the life of the room — someone who brings energy and optimism wherever they go. You are known for your wit and expressive personality.',
    4:  'To the outside world, you appear disciplined, reliable, and serious. Others see you as the dependable one who gets things done without drama. You project an air of competence and integrity that earns deep trust over time.',
    5:  'To the outside world, you appear dynamic, adventurous, and irresistibly interesting. Others see you as someone who is always exciting and full of stories. You project a magnetic, free-spirited energy that attracts people immediately.',
    6:  'To the outside world, you appear warm, responsible, and comforting. Others see you as someone who genuinely cares — a reliable anchor in times of trouble. You project love, stability, and a gracious character that people deeply admire.',
    7:  'To the outside world, you appear reserved, intelligent, and mysterious. Others sense that there is far more to you than meets the eye. You project quiet depth and sophistication, drawing in those who value substance over surface.',
    8:  'To the outside world, you appear powerful, confident, and authoritative. Others see you as someone who means business. You project a commanding presence and an air of capability that positions you naturally in leadership roles.',
    9:  'To the outside world, you appear wise, compassionate, and worldly. Others sense your broad perspective and feel that you genuinely understand them. You project an old-soul wisdom and natural grace that people find deeply reassuring.',
    11: 'To the outside world, you appear otherworldly, inspiring, and quietly electric. Others sense something special about your energy without being able to name it. You project a spiritual luminosity and idealism that makes people want to be around you.',
    22: 'To the outside world, you appear visionary yet grounded — a rare and powerful combination. Others see you as someone capable of pulling off the impossible. You project the quiet confidence of someone who thinks at a scale that most people can\'t imagine.',
    33: 'To the outside world, you appear loving, compassionate, and deeply wise. Others feel healed simply by your presence. You project an all-encompassing warmth and a teacher\'s calm authority that draws people to you for guidance and support.'
  }
};

// ── Lo Shu Grid Predictions
export const LOSHU_PLANE_PREDICTIONS = {
  mental: {
    full:    { title: 'Sharp Mental Plane', text: 'All three numbers of your Mental Plane (4-9-2) are present. You possess exceptional intellectual ability, strong planning skills, and a sharp analytical mind. You are gifted at strategic thinking and can see the big picture while managing details simultaneously.' },
    strong:  { title: 'Active Mental Plane', text: 'Your Mental Plane is well-activated. You think clearly, plan effectively, and solve problems with relative ease. Intellectual pursuits and strategic work come naturally to you.' },
    weak:    { title: 'Developing Mental Plane', text: 'Your Mental Plane is still developing. You may sometimes feel scattered in your thinking or struggle with long-term planning. Practices like journaling, meditation, and structured learning will strengthen this area significantly.' }
  },
  emotional: {
    full:    { title: 'Deeply Emotional Plane', text: 'All three numbers of your Emotional Plane (3-5-7) are present. You experience life with extraordinary depth of feeling. You are highly creative, spiritually aware, and emotionally intelligent. Channeling your feelings into creative or spiritual outlets brings your greatest fulfillment.' },
    strong:  { title: 'Active Emotional Plane', text: 'Your Emotional Plane is well-activated. You are empathetic, creatively inclined, and spiritually curious. Relationships and creative expression are central to your sense of wellbeing.' },
    weak:    { title: 'Developing Emotional Plane', text: 'Your Emotional Plane is still developing. You may sometimes find it challenging to express feelings or connect deeply with others. Exploring creative arts, music, or mindfulness can help you unlock this vital dimension of yourself.' }
  },
  practical: {
    full:    { title: 'Powerful Practical Plane', text: 'All three numbers of your Practical Plane (8-1-6) are present. You are extraordinarily capable of turning ideas into tangible results. Ambition, drive, and the ability to take decisive action are your defining strengths in the material world.' },
    strong:  { title: 'Active Practical Plane', text: 'Your Practical Plane is well-activated. You are action-oriented, dependable, and effective at getting things done. The material world responds well to your grounded, determined energy.' },
    weak:    { title: 'Developing Practical Plane', text: 'Your Practical Plane is still developing. You may sometimes struggle with follow-through, procrastination, or practical organization. Setting small daily goals and building routines will help you unlock your potential for real-world achievement.' }
  }
};

export const LOSHU_MISSING_PREDICTIONS = {
  1: { title: 'Missing 1 — Moon', text: 'The absence of 1 suggests a tendency toward self-doubt and difficulty expressing your individuality. You may rely too heavily on others\' opinions. Your growth lies in developing self-confidence, assertiveness, and the courage to stand alone when needed.' },
  2: { title: 'Missing 2 — Pluto', text: 'The absence of 2 suggests challenges in sensitivity, patience, and cooperative relationships. You may sometimes appear insensitive or overly independent. Your growth lies in practicing active listening, empathy, and learning the art of compromise.' },
  3: { title: 'Missing 3 — Jupiter', text: 'The absence of 3 suggests a difficulty with optimism and creative self-expression. You may struggle to communicate your feelings openly or feel blocked creatively. Your growth lies in pursuing artistic outlets and consciously cultivating a more joyful, expressive approach to life.' },
  4: { title: 'Missing 4 — Rahu', text: 'The absence of 4 suggests challenges with discipline, routine, and practical organization. You may resist structure even when it would benefit you. Your growth lies in building consistent habits, honoring commitments, and learning to value the security that order brings.' },
  5: { title: 'Missing 5 — Mercury', text: 'The absence of 5 suggests a tendency toward emotional extremes and difficulty adapting to change. You may resist new experiences or become overwhelmed by life\'s unpredictability. Your growth lies in embracing flexibility and trusting that change leads to expansion.' },
  6: { title: 'Missing 6 — Venus', text: 'The absence of 6 suggests challenges in the areas of love, domestic responsibility, and community. You may struggle to prioritize family obligations or give and receive affection freely. Your growth lies in opening your heart and learning that true strength includes nurturing.' },
  7: { title: 'Missing 7 — Ketu', text: 'The absence of 7 suggests a tendency to act before reflecting and a resistance to introspection. You may shy away from spiritual or philosophical inquiry. Your growth lies in cultivating a regular inner life through meditation, study, or time in nature.' },
  8: { title: 'Missing 8 — Saturn', text: 'The absence of 8 suggests challenges in the areas of ambition, material planning, and financial discipline. You may underestimate your own capacity for success or avoid long-term goals. Your growth lies in building confidence in your worldly abilities and setting material intentions.' },
  9: { title: 'Missing 9 — Mars', text: 'The absence of 9 suggests a tendency toward self-centeredness or a difficulty seeing the bigger picture of humanity. You may struggle with forgiveness or letting go of the past. Your growth lies in expanding your circle of compassion and contributing to something greater than yourself.' }
};
