/* ============================================================
   EigoPlus — Level Diagnostic Script
   All event handling here. No inline onclick in HTML.
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */
const state = {
  method: null,       // 'auto' | 'level-select'
  level:  null,       // 'beginner' | 'intermediate' | 'advanced'
  goals:  new Set(),  // Set of goal strings
  questions: [],      // flat array of question objects for current quiz
  currentQ:  0,       // current question index
  answers:   [],      // parallel array: { skillId, correct, score }
  resultId:  null
};

/* ----------------------------------------------------------
   QUESTIONS DATA
   ---------------------------------------------------------- */
const allQuestions = {
  listening: [
    {
      skill: 'listening',
      instruction: 'リスニング：音声を聞いて答えてください',
      audioText: 'Hello! My name is Sarah. I work at a coffee shop near the station.',
      question: '音声の内容と合っているものはどれですか？',
      options: [
        { text: 'Sarah は駅の近くのコーヒーショップで働いている', correct: true,  score: 1 },
        { text: 'Sarah は学校の先生である',                      correct: false, score: 0 },
        { text: 'Sarah は病院で働いている',                      correct: false, score: 0 },
        { text: 'Sarah はスーパーマーケットに住んでいる',         correct: false, score: 0 }
      ]
    },
    {
      skill: 'listening',
      instruction: 'リスニング：音声を聞いて答えてください',
      audioText: 'The meeting will start at 3 PM in the conference room on the second floor. Please bring your reports.',
      question: '会議について正しい情報はどれですか？',
      options: [
        { text: '会議は午後3時に2階の会議室で始まる',             correct: true,  score: 1 },
        { text: '会議は午前10時に始まる',                        correct: false, score: 0 },
        { text: '会議はオンラインで行われる',                    correct: false, score: 0 },
        { text: '会議にはレポートの持参は不要',                  correct: false, score: 0 }
      ]
    },
    {
      skill: 'listening',
      instruction: 'リスニング：音声を聞いて答えてください',
      audioText: 'I would like to book a table for two people at 7 PM this Friday. Do you have any availability?',
      question: '話者が求めているものは何ですか？',
      options: [
        { text: '今週金曜日の午後7時に2人分のテーブルの予約',    correct: true,  score: 1 },
        { text: '2人部屋のホテルの予約',                         correct: false, score: 0 },
        { text: '7時のフライトチケット',                         correct: false, score: 0 },
        { text: '2名分の映画チケット',                           correct: false, score: 0 }
      ]
    },
    {
      skill: 'listening',
      instruction: 'リスニング：音声を聞いて答えてください',
      audioText: 'Due to the heavy rain, the outdoor event scheduled for this weekend has been postponed to the following Saturday. We apologize for any inconvenience.',
      question: 'なぜイベントが変更されましたか？',
      options: [
        { text: '大雨のため屋外イベントが延期された',            correct: true,  score: 1 },
        { text: '台風のためイベントが中止された',                correct: false, score: 0 },
        { text: '会場の工事のため移動になった',                  correct: false, score: 0 },
        { text: '参加者が集まらなかったため',                    correct: false, score: 0 }
      ]
    },
    {
      skill: 'listening',
      instruction: 'リスニング：音声を聞いて答えてください',
      audioText: 'Our quarterly earnings exceeded projections by 12 percent, driven largely by strong performance in the Asia-Pacific region and a successful product launch in Q3.',
      question: '業績報告で述べられている内容として正しいものはどれですか？',
      options: [
        { text: '四半期利益は予測を12%上回り、アジア太平洋地域が牽引した',  correct: true,  score: 1 },
        { text: '四半期利益は予測を下回り、製品発売に失敗した',             correct: false, score: 0 },
        { text: 'アジア太平洋地域の業績は低調だった',                       correct: false, score: 0 },
        { text: '第2四半期の新製品が業績を牽引した',                        correct: false, score: 0 }
      ]
    }
  ],

  reading: [
    {
      skill: 'reading',
      instruction: 'リーディング：文章を読んで答えてください',
      passage: 'Tom has a dog named Max. Max loves to play in the park every morning.',
      question: 'Max について正しいことはどれですか？',
      options: [
        { text: 'Max は毎朝公園で遊ぶのが好き',                  correct: true,  score: 1 },
        { text: 'Max は猫である',                               correct: false, score: 0 },
        { text: 'Max は夜だけ散歩する',                          correct: false, score: 0 },
        { text: 'Max は家の中でしか遊ばない',                    correct: false, score: 0 }
      ]
    },
    {
      skill: 'reading',
      instruction: 'リーディング：文章を読んで答えてください',
      passage: 'The store opens at 9 AM and closes at 8 PM on weekdays. On weekends, it opens one hour later and closes at the same time.',
      question: '週末の開店時間は何時ですか？',
      options: [
        { text: '午前10時',   correct: true,  score: 1 },
        { text: '午前9時',    correct: false, score: 0 },
        { text: '午前8時',    correct: false, score: 0 },
        { text: '午後8時',    correct: false, score: 0 }
      ]
    },
    {
      skill: 'reading',
      instruction: 'リーディング：文章を読んで答えてください',
      passage: 'Despite the challenging economic climate, the company managed to maintain profitability by streamlining operations and expanding into new markets in Southeast Asia.',
      question: '企業が利益を維持した主な方法は何ですか？',
      options: [
        { text: '業務の効率化と東南アジアの新市場への参入',       correct: true,  score: 1 },
        { text: '国内市場のみへの集中投資',                      correct: false, score: 0 },
        { text: '従業員数の大幅な増加',                          correct: false, score: 0 },
        { text: '製品価格の大幅な値上げ',                        correct: false, score: 0 }
      ]
    },
    {
      skill: 'reading',
      instruction: 'リーディング：文章を読んで答えてください',
      passage: 'The annual performance review process has been revised to incorporate 360-degree feedback, allowing employees to receive input from peers, subordinates, and supervisors alike.',
      question: '年次評価プロセスの変更点は何ですか？',
      options: [
        { text: '360度フィードバックが導入され、同僚・部下・上司から評価を受ける', correct: true,  score: 1 },
        { text: '評価が年2回から年1回に変更された',                                correct: false, score: 0 },
        { text: '自己評価のみが採用されるようになった',                            correct: false, score: 0 },
        { text: '外部コンサルタントによる評価に切り替わった',                      correct: false, score: 0 }
      ]
    },
    {
      skill: 'reading',
      instruction: 'リーディング：文章を読んで答えてください',
      passage: 'The proliferation of remote work has fundamentally altered workforce dynamics, compelling organizations to reexamine their talent acquisition strategies and invest heavily in digital collaboration infrastructure to sustain productivity and employee engagement.',
      question: 'リモートワークの普及によって企業が取り組んでいることとして最も適切なものは？',
      options: [
        { text: '人材採用戦略の見直しとデジタル協業インフラへの投資',             correct: true,  score: 1 },
        { text: 'オフィスの物理的な拡張と従来の採用方法の強化',                   correct: false, score: 0 },
        { text: 'リモートワーク廃止と全員のオフィス復帰方針',                     correct: false, score: 0 },
        { text: 'フリーランサーへの業務委託の全面廃止',                           correct: false, score: 0 }
      ]
    }
  ],

  speaking: [
    {
      skill: 'speaking',
      instruction: 'スピーキング：場面に合った表現を選んでください',
      scenario: '初めて会った人に自己紹介をしています。',
      question: '「はじめまして。田中と申します。」を英語で言うと？',
      options: [
        { text: 'Nice to meet you. My name is Tanaka.',          correct: true,  score: 1 },
        { text: 'Good to see you again, Tanaka.',                correct: false, score: 0 },
        { text: 'I am called Tanaka, good bye.',                 correct: false, score: 0 },
        { text: 'How do you do, I am Tanaka-san.',               correct: false, score: 0 }
      ]
    },
    {
      skill: 'speaking',
      instruction: 'スピーキング：場面に合った表現を選んでください',
      scenario: 'ビジネスミーティングで、提案に同意したいと思っています。',
      question: '「その提案に賛成します。」を表す最も自然な表現は？',
      options: [
        { text: 'I agree with that proposal.',                   correct: true,  score: 1 },
        { text: 'That proposal is very good for me.',            correct: false, score: 0 },
        { text: 'I like your saying very much.',                 correct: false, score: 0 },
        { text: 'Please do the proposal.',                       correct: false, score: 0 }
      ]
    },
    {
      skill: 'speaking',
      instruction: 'スピーキング：場面に合った表現を選んでください',
      scenario: 'プレゼンテーションの途中で、次のスライドに移る際の一言。',
      question: '「では、次のポイントに移ります。」の最も自然な表現は？',
      options: [
        { text: "Moving on to the next point…",                  correct: true,  score: 1 },
        { text: 'We are now going the next.',                    correct: false, score: 0 },
        { text: 'Please look at the next slide now please.',     correct: false, score: 0 },
        { text: 'Finish this, start next topic.',                correct: false, score: 0 }
      ]
    },
    {
      skill: 'speaking',
      instruction: 'スピーキング：場面に合った表現を選んでください',
      scenario: '上司に急な仕事が入り、約束していたランチを断る必要があります。',
      question: '最も丁寧で適切な断り方はどれですか？',
      options: [
        { text: "I'm afraid I have to cancel our lunch. Something urgent has come up. Could we reschedule?", correct: true,  score: 1 },
        { text: 'I cannot come to lunch. I am busy today.',                                                   correct: false, score: 0 },
        { text: 'Sorry, I forget our lunch meeting today.',                                                   correct: false, score: 0 },
        { text: 'Lunch is no good. I have work.',                                                             correct: false, score: 0 }
      ]
    },
    {
      skill: 'speaking',
      instruction: 'スピーキング：場面に合った表現を選んでください',
      scenario: '国際会議で、相手の発言の意図を明確にしたいと思っています。',
      question: '「それはつまり、〜ということでしょうか？」を最も自然に表現するとしたら？',
      options: [
        { text: "If I understand you correctly, you're suggesting that…?",                                   correct: true,  score: 1 },
        { text: 'What are you meaning by that thing you said?',                                              correct: false, score: 0 },
        { text: 'Please say your point again more clearly.',                                                 correct: false, score: 0 },
        { text: 'I don\'t understand. What do you want to say?',                                             correct: false, score: 0 }
      ]
    }
  ],

  writing: [
    {
      skill: 'writing',
      instruction: 'ライティング：正しい英文を選んでください',
      question: '「私は毎日英語を勉強しています。」の正しい英文は？',
      options: [
        { text: 'I study English every day.',                    correct: true,  score: 1 },
        { text: 'I am studying English every days.',             correct: false, score: 0 },
        { text: 'I studies English everyday.',                   correct: false, score: 0 },
        { text: 'Every day I am study English.',                 correct: false, score: 0 }
      ]
    },
    {
      skill: 'writing',
      instruction: 'ライティング：正しい英文を選んでください',
      question: '「もし明日晴れなら、私たちはピクニックに行きます。」の正しい英文は？',
      options: [
        { text: 'If it is sunny tomorrow, we will go on a picnic.',       correct: true,  score: 1 },
        { text: 'If it will be sunny tomorrow, we will go on a picnic.',  correct: false, score: 0 },
        { text: 'If it is sunny tomorrow, we would go on a picnic.',      correct: false, score: 0 },
        { text: 'When it will be sunny tomorrow, we will picnic.',         correct: false, score: 0 }
      ]
    },
    {
      skill: 'writing',
      instruction: 'ライティング：正しい英文を選んでください',
      question: 'ビジネスメールで「ご確認いただけますでしょうか」と依頼する最も適切な表現は？',
      options: [
        { text: 'Could you please review the attached document?',         correct: true,  score: 1 },
        { text: 'Please you check the document that is attached.',        correct: false, score: 0 },
        { text: 'Can you look the attached document for me please?',      correct: false, score: 0 },
        { text: 'I want you to confirm the document we attached.',        correct: false, score: 0 }
      ]
    },
    {
      skill: 'writing',
      instruction: 'ライティング：正しい英文を選んでください',
      original: 'その会議は2時間以上続いた結果、最終的に合意に達することができた。',
      question: '上記の文として最も適切な英訳はどれですか？',
      options: [
        { text: 'After lasting more than two hours, the meeting finally reached a consensus.',       correct: true,  score: 1 },
        { text: 'The meeting was lasted for more than two hours and reached a final consensus.',     correct: false, score: 0 },
        { text: 'The meeting continued over two hours, we could reached the consensus at last.',    correct: false, score: 0 },
        { text: 'Over two hours the meeting has lasted and consensus has been reached finally.',    correct: false, score: 0 }
      ]
    },
    {
      skill: 'writing',
      instruction: 'ライティング：正しい英文を選んでください',
      original: '規制の変更は、サプライチェーンの効率性に重大な影響を与えるとともに、中小企業にとってはコンプライアンス上の課題をもたらす可能性がある。',
      question: '上記の文として最も適切な英訳はどれですか？',
      options: [
        { text: 'The regulatory changes could significantly impact supply chain efficiency and pose compliance challenges for small and medium-sized enterprises.', correct: true,  score: 1 },
        { text: 'Regulation change will give big impact to supply chain efficiency and small companies may have compliance problems.',                            correct: false, score: 0 },
        { text: 'The changes of regulation impacts supply chains seriously and small businesses have compliance challenge.',                                     correct: false, score: 0 },
        { text: 'Due to regulatory changing, supply chain will be impacted and SMEs face compliance issue.',                                                    correct: false, score: 0 }
      ]
    }
  ]
};

/* ----------------------------------------------------------
   COURSE DATA
   ---------------------------------------------------------- */
const courseData = {
  travel: {
    name: '旅行英語コース',
    icon: 'flight',
    tag: '旅行・観光',
    desc: '海外旅行で困らない実践英語を習得。空港・ホテル・レストラン・観光など、シーン別フレーズを中心に学びます。'
  },
  business: {
    name: 'ビジネス英語コース',
    icon: 'business_center',
    tag: 'ビジネス',
    desc: 'メール・電話・会議・プレゼンなど、実務で使えるビジネス英語を集中特訓。昇進・転職にも直結します。'
  },
  daily: {
    name: '日常英会話コース',
    icon: 'chat',
    tag: '日常会話',
    desc: '日常のあらゆる場面で自然に英語が使えるようになるコース。フリートーキングと文法の両輪で力をつけます。'
  },
  'study-abroad': {
    name: '留学準備コース',
    icon: 'public',
    tag: '留学',
    desc: '留学・海外大学進学に向けたアカデミック英語を習得。エッセイライティング・リスニング強化も対応。'
  },
  presentation: {
    name: 'プレゼン英語コース',
    icon: 'mic',
    tag: 'プレゼン',
    desc: '英語でのプレゼンテーション・スピーチスキルを磨きます。構成・話し方・Q&A対応まで一貫指導。'
  },
  meeting: {
    name: 'ビジネス英語コース',
    icon: 'groups',
    tag: '会議・交渉',
    desc: '国際会議・交渉・ネゴシエーションに特化した実践コース。即座に意見を伝える力を養います。'
  },
  career: {
    name: 'キャリアアップ英語コース',
    icon: 'trending_up',
    tag: 'キャリア',
    desc: '転職・昇進・グローバルキャリアを目指す方向け。英文履歴書・面接対策・ビジネス英語を網羅します。'
  },
  toeic: {
    name: 'TOEIC対策コース',
    icon: 'assignment',
    tag: 'TOEIC',
    desc: '短期集中でTOEICスコアアップを狙うコース。リスニング・リーディング両パートを体系的に対策します。'
  },
  eiken: {
    name: '英検対策コース',
    icon: 'school',
    tag: '英検',
    desc: '英検2級〜1級の取得を目指す専門コース。一次試験（読む・聞く・書く）から二次面接まで完全対応。'
  },
  'ai-app-failed': {
    name: '対面英会話スタートコース',
    icon: 'people',
    tag: '対面・マンツーマン',
    desc: 'アプリや独学で挫折した方に最適。プロ講師との対話で確実にステップアップできる環境をご用意します。'
  },
  other: {
    name: '総合英語コース',
    icon: 'auto_awesome',
    tag: 'バランス学習',
    desc: '4技能をバランスよく伸ばす標準コース。目標・レベルに合わせて柔軟にカリキュラムをカスタマイズします。'
  }
};

/* ----------------------------------------------------------
   UTILITY FUNCTIONS
   ---------------------------------------------------------- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function generateResultId() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const d   = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return 'LVL-' + y + m + d + '-' + rand;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function calcToeic(listeningCorrect, readingCorrect, maxPerSkill) {
  const ls = Math.round((listeningCorrect / maxPerSkill) * 495);
  const rs = Math.round((readingCorrect  / maxPerSkill) * 495);
  return ls + rs;
}

function toeicToEiken(toeic) {
  if (toeic >= 900) return '1級';
  if (toeic >= 800) return '準1級';
  if (toeic >= 650) return '2級';
  if (toeic >= 500) return '準2級';
  if (toeic >= 350) return '3級';
  if (toeic >= 250) return '4級';
  return '5級';
}

function toeicToCefr(toeic) {
  if (toeic >= 945) return 'C2';
  if (toeic >= 785) return 'C1';
  if (toeic >= 550) return 'B2';
  if (toeic >= 225) return 'B1';
  if (toeic >= 120) return 'A2';
  return 'A1';
}

function starsFor(level) {
  const map = {
    '入門':       '★☆☆☆☆',
    '初級':       '★★☆☆☆',
    '初級〜中級': '★★★☆☆',
    '中級':       '★★★☆☆',
    '中級〜上級': '★★★★☆',
    '上級':       '★★★★★'
  };
  return map[level] || '★★★☆☆';
}

function levelToEnglish(level) {
  const map = {
    '入門':       'Beginner',
    '初級':       'Elementary',
    '初級〜中級': 'Pre-Intermediate',
    '中級':       'Intermediate',
    '中級〜上級': 'Upper-Intermediate',
    '上級':       'Advanced'
  };
  return map[level] || 'Intermediate';
}

function motivationalMessage(level) {
  const map = {
    '入門':       'これからスタート！基礎から丁寧にサポートします。焦らず一歩ずつ確実に英語力を積み上げましょう。',
    '初級':       '日常の挨拶や簡単な表現はバッチリ。次のステップで会話の幅を一気に広げましょう！',
    '初級〜中級': '土台がしっかりついています。あともう一押しで中級の壁を突破できます！',
    '中級':       '日常会話に自信あり。ビジネスや専門的な場面でも通用する力を一緒に伸ばしましょう。',
    '中級〜上級': '高い英語力をお持ちです！より洗練された表現やニュアンスを磨いて、上級者へ進化しましょう。',
    '上級':       'すばらしい英語力です！ネイティブレベルの自然な表現や専門的なコミュニケーションを極めましょう。'
  };
  return map[level] || 'あなたの目標に向けて、一緒に取り組みましょう！';
}

function skillAdvice(scores) {
  const advice = [];
  const skillNames = { listening: 'リスニング', reading: 'リーディング', speaking: 'スピーキング', writing: 'ライティング' };
  const skillAdviceMap = {
    listening: '英語のリズムや音に慣れるため、毎日短時間でも英語音声を聴く習慣をつけましょう。ニュースポッドキャストやドラマが効果的です。',
    reading:   '語彙力と速読力を上げるために、英語の記事や本を読む練習をしましょう。わからない単語はメモして覚える習慣をつけましょう。',
    speaking:  '口に出す練習が鍵です。独り言を英語でつぶやく「シャドーイング」を毎日試しましょう。間違いを恐れずに声に出すことが大切です。',
    writing:   '基本的な文法ルールを確認し、短い英文を毎日書く練習をしましょう。日記を英語で書くのも非常に効果的です。'
  };
  const MAX_PER_SKILL = 5;

  Object.keys(scores).forEach(function(skill) {
    const ratio = scores[skill] / MAX_PER_SKILL;
    if (ratio < 0.6) {
      advice.push({ skill: skillNames[skill], text: skillAdviceMap[skill] });
    }
  });

  if (advice.length === 0) {
    advice.push({ skill: '全技能', text: '非常に高い英語力をお持ちです。さらに上を目指して、ネイティブとのディスカッションや専門的なライティングに挑戦しましょう。' });
  }

  return advice;
}

function getRecommendedCourse(goals) {
  const priority = ['business', 'meeting', 'presentation', 'career', 'toeic', 'eiken', 'study-abroad', 'travel', 'daily', 'ai-app-failed'];
  for (let i = 0; i < priority.length; i++) {
    if (goals.has(priority[i])) {
      return courseData[priority[i]];
    }
  }
  return courseData['other'];
}

/* ----------------------------------------------------------
   AUDIO PLAYBACK (Web Speech API — best-voice selection)
   ---------------------------------------------------------- */

// 優先順位付き音声リスト（品質の高い順）
const PREFERRED_VOICES = [
  // Microsoft Edge ニューラル音声（最高品質）
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  // Google TTS（高品質）
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  // Apple macOS / iOS（自然）
  'Samantha',           // macOS en-US
  'Alex',               // macOS en-US
  'Karen',              // macOS en-AU
  'Daniel',             // macOS en-GB
  'Moira',              // macOS en-IE
  // Windows 組み込み
  'Microsoft Zira Desktop - English (United States)',
  'Microsoft David Desktop - English (United States)',
];

let _cachedVoice = null;

/** 利用可能な最高品質の英語音声を返す */
function getBestEnglishVoice() {
  if (_cachedVoice) return Promise.resolve(_cachedVoice);

  return new Promise(function(resolve) {
    function pick() {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;

      // 1. 優先リストから完全一致
      for (const name of PREFERRED_VOICES) {
        const v = voices.find(function(v) { return v.name === name; });
        if (v) return v;
      }
      // 2. 優先リストから部分一致（"Natural" を含むもの優先）
      const natural = voices.find(function(v) {
        return v.lang.startsWith('en') && v.name.toLowerCase().includes('natural');
      });
      if (natural) return natural;

      // 3. "Online" を含む en-US 音声
      const online = voices.find(function(v) {
        return v.lang === 'en-US' && v.name.toLowerCase().includes('online');
      });
      if (online) return online;

      // 4. en-US ならなんでも
      const enUS = voices.find(function(v) { return v.lang === 'en-US'; });
      if (enUS) return enUS;

      // 5. 英語ならなんでも
      return voices.find(function(v) { return v.lang.startsWith('en'); }) || null;
    }

    const immediate = pick();
    if (immediate) {
      _cachedVoice = immediate;
      return resolve(immediate);
    }

    // 音声リストがまだロードされていない場合（Chrome の初回ロード問題）
    window.speechSynthesis.addEventListener('voiceschanged', function handler() {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      _cachedVoice = pick();
      resolve(_cachedVoice);
    });
  });
}

function playAudio(text, btn) {
  if (!window.speechSynthesis) {
    btn.title = 'お使いのブラウザは音声再生に対応していません';
    return;
  }

  // 再生中なら停止
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    btn.innerHTML = '<span class="material-icons">volume_up</span> 音声を再生する';
    return;
  }

  btn.innerHTML = '<span class="material-icons">hourglass_top</span> 読み込み中...';

  getBestEnglishVoice().then(function(voice) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = 'en-US';
    utterance.rate  = 0.82;   // 自然なペース（速すぎず遅すぎず）
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    if (voice) utterance.voice = voice;

    btn.innerHTML = '<span class="material-icons">stop_circle</span> 再生中（クリックで停止）';

    utterance.onstart = function() {
      btn.innerHTML = '<span class="material-icons">stop_circle</span> 再生中（クリックで停止）';
    };

    utterance.onend = function() {
      btn.innerHTML = '<span class="material-icons">volume_up</span> 音声を再生する';
    };

    utterance.onerror = function() {
      btn.innerHTML = '<span class="material-icons">volume_up</span> 音声を再生する';
    };

    window.speechSynthesis.speak(utterance);
  });
}

/* ----------------------------------------------------------
   QUIZ LOGIC
   ---------------------------------------------------------- */
function startQuiz() {
  state.questions = [];
  state.currentQ  = 0;
  state.answers   = [];

  if (state.method === 'auto' || state.level === 'advanced') {
    // All 5 per skill = 20 questions
    state.questions = [
      ...allQuestions.listening,
      ...allQuestions.reading,
      ...allQuestions.speaking,
      ...allQuestions.writing
    ];
  } else if (state.level === 'beginner') {
    // 5 questions: listening[0-1], reading[0], speaking[0], writing[0]
    state.questions = shuffle([
      allQuestions.listening[0],
      allQuestions.listening[1],
      allQuestions.reading[0],
      allQuestions.speaking[0],
      allQuestions.writing[0]
    ]);
  } else if (state.level === 'intermediate') {
    // 10 questions: listening[0-2], reading[0-2], speaking[0-1], writing[0-1]
    state.questions = shuffle([
      allQuestions.listening[0],
      allQuestions.listening[1],
      allQuestions.listening[2],
      allQuestions.reading[0],
      allQuestions.reading[1],
      allQuestions.reading[2],
      allQuestions.speaking[0],
      allQuestions.speaking[1],
      allQuestions.writing[0],
      allQuestions.writing[1]
    ]);
  }

  showScreen('screen-quiz');
  loadQuestion();
}

function loadQuestion() {
  if (state.currentQ >= state.questions.length) {
    showResult();
    return;
  }

  const q        = state.questions[state.currentQ];
  const total    = state.questions.length;
  const progress = Math.round((state.currentQ / total) * 100);

  // Update progress
  const progressEl = document.getElementById('quiz-progress');
  if (progressEl) progressEl.style.width = progress + '%';

  // Update counter
  const counterEl = document.getElementById('quiz-counter');
  if (counterEl) counterEl.textContent = (state.currentQ + 1) + '/' + total;

  // Update skill badge
  const badgeEl = document.getElementById('quiz-skill-badge');
  if (badgeEl) {
    const badgeLabels = { listening: 'Listening', reading: 'Reading', speaking: 'Speaking', writing: 'Writing' };
    const badgeClasses = { listening: 'badge-listening', reading: 'badge-reading', speaking: 'badge-speaking', writing: 'badge-writing' };
    badgeEl.textContent = badgeLabels[q.skill] || q.skill;
    badgeEl.className = 'skill-badge ' + (badgeClasses[q.skill] || '');
  }

  // Build question HTML
  let html = '';
  html += '<div class="question-instruction">' + escapeHtml(q.instruction) + '</div>';

  if (q.audioText) {
    html += '<button class="audio-btn" id="audio-play-btn" data-audio="' + escapeAttr(q.audioText) + '">';
    html += '<span class="material-icons">volume_up</span> 音声を再生する';
    html += '</button>';
  }

  if (q.passage) {
    html += '<div class="question-passage">' + escapeHtml(q.passage) + '</div>';
  }

  if (q.original) {
    html += '<div class="question-original">' + escapeHtml(q.original) + '</div>';
  }

  if (q.scenario) {
    html += '<div class="question-scenario"><strong>場面：</strong>' + escapeHtml(q.scenario) + '</div>';
  }

  html += '<div class="question-text">' + escapeHtml(q.question) + '</div>';
  html += '<div class="options-list">';
  q.options.forEach(function(opt, idx) {
    html += '<div class="option-card" data-idx="' + idx + '">' + escapeHtml(opt.text) + '</div>';
  });
  html += '</div>';

  const card = document.getElementById('question-card');
  if (card) card.innerHTML = html;

  // Disable next button
  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.onclick = null;
  }

  // Attach option click handlers
  let selectedOption = null;
  const options = card ? card.querySelectorAll('.option-card') : [];
  options.forEach(function(optEl) {
    optEl.addEventListener('click', function(e) {
      e.stopPropagation();
      options.forEach(function(o) { o.classList.remove('selected'); });
      optEl.classList.add('selected');
      const idx = parseInt(optEl.getAttribute('data-idx'), 10);
      selectedOption = q.options[idx];
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  // Next button handler
  if (nextBtn) {
    nextBtn.onclick = function() {
      handleAnswer(selectedOption);
    };
  }

  // Skip button handler
  const skipBtn = document.getElementById('quiz-skip-btn');
  if (skipBtn) {
    skipBtn.onclick = function() {
      handleAnswer(null);
    };
  }

  // Audio button handler
  const audioBtn = document.getElementById('audio-play-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const text = audioBtn.getAttribute('data-audio');
      playAudio(text, audioBtn);
    });
  }
}

function handleAnswer(selectedOption) {
  // Cancel any playing audio
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const q = state.questions[state.currentQ];
  state.answers.push({
    skillId: q.skill,
    correct: selectedOption ? selectedOption.correct : false,
    score:   selectedOption && selectedOption.correct ? 1 : 0
  });

  state.currentQ++;
  loadQuestion();
}

/* ----------------------------------------------------------
   SHOW RESULT
   ---------------------------------------------------------- */
function showResult() {
  // Tally scores per skill
  const scores = { listening: 0, reading: 0, speaking: 0, writing: 0 };
  state.answers.forEach(function(a) {
    if (a.correct && scores[a.skillId] !== undefined) {
      scores[a.skillId]++;
    }
  });

  const totalCorrect = Object.values(scores).reduce(function(a, b) { return a + b; }, 0);
  const totalQ       = state.questions.length;

  // Determine level label
  let levelJapanese = '初級';
  if (state.method === 'auto' || state.level === 'advanced') {
    if      (totalCorrect >= 16) levelJapanese = '上級';
    else if (totalCorrect >= 12) levelJapanese = '中級〜上級';
    else if (totalCorrect >=  8) levelJapanese = '中級';
    else if (totalCorrect >=  4) levelJapanese = '初級〜中級';
    else                          levelJapanese = '初級';
  } else if (state.level === 'beginner') {
    if      (totalCorrect === 5) levelJapanese = '初級（中級をおすすめ）';
    else if (totalCorrect >=  3) levelJapanese = '初級';
    else                          levelJapanese = '入門';
  } else if (state.level === 'intermediate') {
    if      (totalCorrect >=  8) levelJapanese = '中級〜上級';
    else if (totalCorrect >=  6) levelJapanese = '中級';
    else if (totalCorrect >=  4) levelJapanese = '初級〜中級';
    else                          levelJapanese = '初級';
  }

  const levelEnglish = levelToEnglish(levelJapanese);
  const stars        = starsFor(levelJapanese);
  const resultId     = generateResultId();
  state.resultId     = resultId;

  // Calculate TOEIC only for auto (20 questions, 5 per skill)
  let toeicScore = null;
  let eikenLevel = null;
  let cefrLevel  = null;
  if (state.method === 'auto' || state.level === 'advanced') {
    toeicScore = calcToeic(scores.listening, scores.reading, 5);
    eikenLevel = toeicToEiken(toeicScore);
    cefrLevel  = toeicToCefr(toeicScore);
  }

  const advice       = skillAdvice(scores);
  const course       = getRecommendedCourse(state.goals);
  const hasAiAppFail = state.goals.has('ai-app-failed');

  // Build result HTML
  let html = '';

  // Top section
  html += '<div class="result-top">';
  html += '  <div class="result-celebration"><span class="material-icons">celebration</span></div>';
  html += '  <h2>診断完了！</h2>';
  html += '</div>';

  // Result ID card
  html += '<div class="result-id-card">';
  html += '  <p class="result-id-label">診断結果ID <small>スタッフが事前に確認します</small></p>';
  html += '  <div class="result-id-value">' + escapeHtml(resultId) + '</div>';
  html += '  <button class="btn-copy" id="copy-result-id"><span class="material-icons">content_copy</span> コピー</button>';
  html += '</div>';

  // Level card
  html += '<div class="level-card-result">';
  html += '  <div class="level-badge">';
  html += '    <div class="level-badge-stars">' + stars + '</div>';
  html += '    <div class="level-badge-name">' + escapeHtml(levelJapanese) + '</div>';
  html += '    <div class="level-badge-en">' + escapeHtml(levelEnglish) + '</div>';
  html += '  </div>';
  html += '  <div class="level-score">総合スコア: ' + totalCorrect + ' / ' + totalQ + '問正解</div>';
  html += '  <p class="level-message">' + escapeHtml(motivationalMessage(levelJapanese)) + '</p>';
  html += '</div>';

  // Skill scores (auto / advanced)
  if (state.method === 'auto' || state.level === 'advanced') {
    html += '<div class="skill-scores-card">';
    html += '  <h3>4技能スコア</h3>';
    html += '  <div class="skill-bar-list">';

    const skillConfig = [
      { id: 'listening', label: 'リスニング', fillClass: 'fill-listening' },
      { id: 'reading',   label: 'リーディング', fillClass: 'fill-reading' },
      { id: 'speaking',  label: 'スピーキング', fillClass: 'fill-speaking' },
      { id: 'writing',   label: 'ライティング', fillClass: 'fill-writing' }
    ];

    skillConfig.forEach(function(sc) {
      const correct = scores[sc.id];
      const pct     = Math.round((correct / 5) * 100);
      html += '<div class="skill-bar-item">';
      html += '  <div class="skill-bar-label">' + sc.label + '</div>';
      html += '  <div class="skill-bar-track">';
      html += '    <div class="skill-bar-fill ' + sc.fillClass + '" style="width:' + pct + '%"></div>';
      html += '  </div>';
      html += '  <div class="skill-bar-score">' + correct + '/5</div>';
      html += '</div>';
    });

    html += '  </div>';
    html += '</div>';

    // Certification card
    html += '<div class="certification-card">';
    html += '  <h3>推定レベル認定</h3>';
    html += '  <table class="cert-table">';
    html += '    <tr><td>TOEIC換算</td><td>' + toeicScore + ' 点</td></tr>';
    html += '    <tr><td>英検目安</td><td>' + escapeHtml(eikenLevel) + '</td></tr>';
    html += '    <tr><td>CEFR</td><td>' + escapeHtml(cefrLevel) + '</td></tr>';
    html += '  </table>';
    html += '</div>';
  }

  // Advice
  html += '<div class="advice-card">';
  html += '  <h3>アドバイス</h3>';
  html += '  <div class="advice-list">';
  advice.forEach(function(item) {
    html += '  <div class="advice-item">';
    html += '    <span class="material-icons">lightbulb</span>';
    html += '    <div><strong>' + escapeHtml(item.skill) + '：</strong>' + escapeHtml(item.text) + '</div>';
    html += '  </div>';
  });
  html += '  </div>';
  html += '</div>';

  // AI app failed message
  if (hasAiAppFail) {
    html += '<div class="ai-message-card">';
    html += '  <h3><span class="material-icons" style="vertical-align:middle;margin-right:6px;font-size:20px;">info</span>アプリが続かなかったあなたへ</h3>';
    html += '  <p>英語アプリは手軽な反面、一人では継続が難しく、「実際に話せない」という課題が残りがちです。対面レッスンでは、プロ講師がリアルタイムで発音・表現を修正し、あなたのモチベーションに合わせた学習計画を一緒に立てます。まずは無料体験で違いを実感してください。</p>';
    html += '</div>';
  }

  // Course recommendation
  html += '<div class="course-card-result">';
  html += '  <h3>おすすめコース</h3>';
  html += '  <div class="course-header">';
  html += '    <div class="course-icon"><span class="material-icons">' + escapeHtml(course.icon) + '</span></div>';
  html += '    <div>';
  html += '      <div class="course-name">' + escapeHtml(course.name) + '</div>';
  html += '      <span class="course-tag">' + escapeHtml(course.tag) + '</span>';
  html += '    </div>';
  html += '  </div>';
  html += '  <p class="course-desc">' + escapeHtml(course.desc) + '</p>';
  html += '</div>';

  // CTA
  html += '<div class="result-cta">';
  html += '  <h3>無料体験レッスン・カウンセリング</h3>';
  html += '  <p>診断結果をもとにぴったりのコースをご提案します</p>';
  html += '  <div class="cta-benefits">';
  html += '    <span><span class="material-icons">check</span> 無料体験レッスン（40分）</span>';
  html += '    <span><span class="material-icons">check</span> 無料カウンセリング（30分）</span>';
  html += '    <span><span class="material-icons">check</span> 診断結果IDで来校もスムーズ</span>';
  html += '  </div>';
  html += '  <button class="btn-primary btn-block" id="result-trial-btn">無料体験レッスンを予約する</button>';
  html += '  <button class="btn-primary btn-block btn-secondary-style" id="result-counseling-btn">無料カウンセリングを予約する</button>';
  html += '  <button class="btn-text" id="result-contact-btn">その他のお問い合わせ</button>';
  html += '</div>';

  const resultContent = document.getElementById('result-content');
  if (resultContent) resultContent.innerHTML = html;

  showScreen('screen-result');

  // Attach result button handlers
  const trialBtn = document.getElementById('result-trial-btn');
  if (trialBtn) {
    trialBtn.addEventListener('click', function() {
      prefillContact('trial-lesson');
    });
  }

  const counselingBtn = document.getElementById('result-counseling-btn');
  if (counselingBtn) {
    counselingBtn.addEventListener('click', function() {
      prefillContact('counseling');
    });
  }

  const contactBtn = document.getElementById('result-contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', function() {
      prefillContact('other');
    });
  }

  const copyBtn = document.getElementById('copy-result-id');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(state.resultId).then(function() {
          copyBtn.innerHTML = '<span class="material-icons">check</span> コピーしました';
          setTimeout(function() {
            copyBtn.innerHTML = '<span class="material-icons">content_copy</span> コピー';
          }, 2000);
        });
      } else {
        // Fallback: create a temporary textarea and use a hidden input to copy
        try {
          const ta = document.createElement('textarea');
          ta.value = state.resultId || '';
          ta.style.position = 'fixed';
          ta.style.opacity  = '0';
          ta.style.top      = '0';
          ta.style.left     = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          // Wrapped in try/catch — this path is only reached on very old browsers
          // where navigator.clipboard is unavailable; no modern alternative exists.
          const success = window.document.execCommand('copy'); // eslint-disable-line
          document.body.removeChild(ta);
          if (success) {
            copyBtn.innerHTML = '<span class="material-icons">check</span> コピーしました';
            setTimeout(function() {
              copyBtn.innerHTML = '<span class="material-icons">content_copy</span> コピー';
            }, 2000);
          }
        } catch (_) {
          // Silent fail — clipboard unavailable in this environment
        }
      }
    });
  }
}

/* ----------------------------------------------------------
   CONTACT PREFILL
   ---------------------------------------------------------- */
function prefillContact(type) {
  const resultIdField = document.getElementById('f-result-id');
  if (resultIdField) {
    resultIdField.value = state.resultId || '';
  }

  const typeField = document.getElementById('f-type');
  if (typeField && type) {
    typeField.value = type;
  }

  showScreen('screen-contact');
}

/* ----------------------------------------------------------
   FORM VALIDATION
   ---------------------------------------------------------- */
function validateForm() {
  let valid = true;

  const name      = document.getElementById('f-name');
  const nameErr   = document.getElementById('f-name-err');
  const email     = document.getElementById('f-email');
  const emailErr  = document.getElementById('f-email-err');
  const phone     = document.getElementById('f-phone');
  const phoneErr  = document.getElementById('f-phone-err');

  // Clear previous errors
  [name, email, phone].forEach(function(el) { if (el) el.classList.remove('error'); });
  [nameErr, emailErr, phoneErr].forEach(function(el) { if (el) el.textContent = ''; });

  // Name
  if (!name || !name.value.trim()) {
    if (name) name.classList.add('error');
    if (nameErr) nameErr.textContent = 'お名前を入力してください';
    valid = false;
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.value.trim())) {
    if (email) email.classList.add('error');
    if (emailErr) emailErr.textContent = '有効なメールアドレスを入力してください';
    valid = false;
  }

  // Phone
  const phoneRegex = /^[\d\-+()\s]+$/;
  if (!phone || !phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
    if (phone) phone.classList.add('error');
    if (phoneErr) phoneErr.textContent = '有効な電話番号を入力してください（数字とハイフンのみ）';
    valid = false;
  }

  return valid;
}

/* ----------------------------------------------------------
   HTML ESCAPE UTILITIES
   ---------------------------------------------------------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/* ----------------------------------------------------------
   RESET STATE
   ---------------------------------------------------------- */
function resetState() {
  state.method    = null;
  state.level     = null;
  state.goals     = new Set();
  state.questions = [];
  state.currentQ  = 0;
  state.answers   = [];
  state.resultId  = null;
}

/* ----------------------------------------------------------
   MAIN: DOMContentLoaded
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {

  /* ---- Landing ---- */
  const heroStartBtn = document.getElementById('hero-start-btn');
  if (heroStartBtn) {
    heroStartBtn.addEventListener('click', function() {
      showScreen('screen-method');
    });
  }

  const ctaStartBtn = document.getElementById('cta-start-btn');
  if (ctaStartBtn) {
    ctaStartBtn.addEventListener('click', function() {
      showScreen('screen-method');
    });
  }

  const ctaTrialBtn = document.getElementById('cta-trial-btn');
  if (ctaTrialBtn) {
    ctaTrialBtn.addEventListener('click', function() {
      prefillContact('trial-lesson');
    });
  }

  const navTrialBtn = document.getElementById('nav-trial-btn');
  if (navTrialBtn) {
    navTrialBtn.addEventListener('click', function() {
      prefillContact('trial-lesson');
    });
  }

  /* ---- Method Screen ---- */
  const cardAuto  = document.getElementById('card-auto');
  const cardLevel = document.getElementById('card-level');
  const methodNextBtn = document.getElementById('method-next-btn');
  const methodBackBtn = document.getElementById('method-back-btn');

  if (cardAuto) {
    cardAuto.addEventListener('click', function(e) {
      e.stopPropagation();
      state.method = 'auto';
      cardAuto.classList.add('selected');
      if (cardLevel) cardLevel.classList.remove('selected');
      if (methodNextBtn) methodNextBtn.disabled = false;
    });
  }

  if (cardLevel) {
    cardLevel.addEventListener('click', function(e) {
      e.stopPropagation();
      state.method = 'level-select';
      cardLevel.classList.add('selected');
      if (cardAuto) cardAuto.classList.remove('selected');
      if (methodNextBtn) methodNextBtn.disabled = false;
    });
  }

  if (methodNextBtn) {
    methodNextBtn.addEventListener('click', function() {
      if (state.method === 'auto') {
        showScreen('screen-goal');
      } else if (state.method === 'level-select') {
        showScreen('screen-level');
      }
    });
  }

  if (methodBackBtn) {
    methodBackBtn.addEventListener('click', function() {
      showScreen('screen-landing');
    });
  }

  /* ---- Level Screen ---- */
  const levelNextBtn = document.getElementById('level-next-btn');
  const levelBackBtn = document.getElementById('level-back-btn');

  const levelCards = document.querySelectorAll('.level-card');
  levelCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      levelCards.forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      state.level = card.getAttribute('data-level');
      if (levelNextBtn) levelNextBtn.disabled = false;
    });
  });

  if (levelNextBtn) {
    levelNextBtn.addEventListener('click', function() {
      showScreen('screen-goal');
    });
  }

  if (levelBackBtn) {
    levelBackBtn.addEventListener('click', function() {
      showScreen('screen-method');
    });
  }

  /* ---- Goal Screen ---- */
  const goalNextBtn = document.getElementById('goal-next-btn');
  const goalBackBtn = document.getElementById('goal-back-btn');

  const goalCards = document.querySelectorAll('.goal-card');
  goalCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      const goal = card.getAttribute('data-goal');
      if (state.goals.has(goal)) {
        state.goals.delete(goal);
        card.classList.remove('selected');
      } else {
        state.goals.add(goal);
        card.classList.add('selected');
      }
      if (goalNextBtn) {
        goalNextBtn.disabled = state.goals.size === 0;
      }
    });
  });

  if (goalNextBtn) {
    goalNextBtn.addEventListener('click', function() {
      startQuiz();
    });
  }

  if (goalBackBtn) {
    goalBackBtn.addEventListener('click', function() {
      if (state.method === 'auto') {
        showScreen('screen-method');
      } else {
        showScreen('screen-level');
      }
    });
  }

  /* ---- Contact Screen ---- */
  const contactBackBtn = document.getElementById('contact-back-btn');
  if (contactBackBtn) {
    contactBackBtn.addEventListener('click', function() {
      if (state.resultId) {
        showScreen('screen-result');
      } else {
        showScreen('screen-landing');
      }
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm()) {
        showScreen('screen-thanks');
      }
    });
  }

  /* ---- Thanks Screen ---- */
  const thanksHomeBtn = document.getElementById('thanks-home-btn');
  if (thanksHomeBtn) {
    thanksHomeBtn.addEventListener('click', function() {
      resetState();

      // Reset method cards
      const cAuto  = document.getElementById('card-auto');
      const cLevel = document.getElementById('card-level');
      const mNext  = document.getElementById('method-next-btn');
      if (cAuto)  cAuto.classList.remove('selected');
      if (cLevel) cLevel.classList.remove('selected');
      if (mNext)  mNext.disabled = true;

      // Reset level cards
      document.querySelectorAll('.level-card').forEach(function(c) {
        c.classList.remove('selected');
      });
      const lNext = document.getElementById('level-next-btn');
      if (lNext) lNext.disabled = true;

      // Reset goal cards
      document.querySelectorAll('.goal-card').forEach(function(c) {
        c.classList.remove('selected');
      });
      const gNext = document.getElementById('goal-next-btn');
      if (gNext) gNext.disabled = true;

      // Reset contact form
      const form = document.getElementById('contact-form');
      if (form) form.reset();
      const resultIdField = document.getElementById('f-result-id');
      if (resultIdField) resultIdField.value = '';

      showScreen('screen-landing');
    });
  }

});
