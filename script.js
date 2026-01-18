// グローバル変数
// selectedPurposesはindex.htmlで定義されているが、念のため参照を確認
if (typeof selectedPurposes === 'undefined') {
    window.selectedPurposes = [];
}
let currentSkillIndex = 0; // 現在の技能（0: リスニング, 1: リーディング, 2: スピーキング, 3: ライティング）
let currentQuestionIndex = 0;
let skillAnswers = {
    listening: [],
    reading: [],
    speaking: [],
    writing: []
};
let resultData = null;
let diagnosisQuestions = null; // 診断方法に応じた問題セット
let diagnosisSkills = []; // 診断方法に応じた技能リスト

// 技能名
const skills = [
    { id: 'listening', name: 'リスニング', icon: '🎧' },
    { id: 'reading', name: 'リーディング', icon: '📖' },
    { id: 'speaking', name: 'スピーキング', icon: '🗣️' },
    { id: 'writing', name: 'ライティング', icon: '✍️' }
];

// 4技能対応の問題データ（バランスの取れた難易度：簡単→普通→難しい）
const questionsData = {
    listening: [
        // 簡単（初心者向け）
        {
            skill: 'listening',
            instruction: '音声を聞いて、適切な応答を選んでください。',
            audioText: "Hello, how are you?",
            question: "この音声に対する適切な応答は？",
            options: [
                { text: "I'm fine, thank you. And you?", correct: true, score: 3 },
                { text: "I'm fine, thanks. How about you?", correct: false, score: 2 },
                { text: "I'm good, thank you.", correct: false, score: 1 },
                { text: "Good morning.", correct: false, score: 0 }
            ]
        },
        // 普通（中級者向け）
        {
            skill: 'listening',
            instruction: '音声を聞いて、適切な応答を選んでください。',
            audioText: "I'm sorry, but I can't make it to the meeting tomorrow.",
            question: "この音声に対する適切な応答は？",
            options: [
                { text: "That's okay. We can reschedule.", correct: true, score: 3 },
                { text: "No problem. Let's reschedule it.", correct: false, score: 2 },
                { text: "Yes, I understand.", correct: false, score: 1 },
                { text: "Thank you.", correct: false, score: 0 }
            ]
        },
        {
            skill: 'listening',
            instruction: '音声を聞いて、詳細情報を聞き取ってください。',
            audioText: "The conference will be held in Room 301 at 2 PM. Please bring your presentation materials.",
            question: "音声の内容として正しいのは？",
            options: [
                { text: "会議は午後2時に301号室で行われます。", correct: true, score: 3 },
                { text: "会議は午後2時に301号室で行われ、資料を持参する必要があります。", correct: false, score: 2 },
                { text: "会議は午前2時に301号室で行われます。", correct: false, score: 1 },
                { text: "会議は午後2時に201号室で行われます。", correct: false, score: 0 }
            ]
        },
        // 難しい（上級者向け）
        {
            skill: 'listening',
            instruction: '音声を聞いて、話者の意図を推測してください。',
            audioText: "I was wondering if you could help me with this project. It's due next week and I'm a bit behind schedule.",
            question: "話者は何を求めていますか？",
            options: [
                { text: "プロジェクトの手伝い", correct: true, score: 3 },
                { text: "プロジェクトのサポート", correct: false, score: 2 },
                { text: "プロジェクトの延期", correct: false, score: 1 },
                { text: "プロジェクトの説明", correct: false, score: 0 }
            ]
        },
        {
            skill: 'listening',
            instruction: '音声を聞いて、会話の文脈を理解してください。',
            audioText: "A: Have you finished the report? B: Almost. I just need to add the conclusion. A: Great! Can you send it to me by 5 PM?",
            question: "会話の内容として正しいのは？",
            options: [
                { text: "Bは報告書をほぼ完成させており、午後5時までに送る予定", correct: true, score: 3 },
                { text: "Bは報告書を完成させており、午後5時までに送る予定", correct: false, score: 2 },
                { text: "Bは報告書をまだ始めていない", correct: false, score: 0 },
                { text: "Bは報告書を午後5時までに完成させる", correct: false, score: 1 }
            ]
        }
    ],
    reading: [
        // 簡単（初心者向け）
        {
            skill: 'reading',
            instruction: '次の文章を読んで、空欄に適切な語句を選んでください。',
            passage: "I _____ to the store yesterday.",
            question: "空欄に入る最も適切な語句は？",
            options: [
                { text: "went", correct: true, score: 3 },
                { text: "was going", correct: false, score: 2 },
                { text: "go", correct: false, score: 1 },
                { text: "going", correct: false, score: 0 }
            ]
        },
        // 普通（中級者向け）
        {
            skill: 'reading',
            instruction: '次の文章を読んで、空欄に適切な語句を選んでください。',
            passage: "The company has decided to _____ its operations to reduce costs and improve efficiency.",
            question: "空欄に入る最も適切な語句は？",
            options: [
                { text: "restructure", correct: true, score: 3 },
                { text: "restore", correct: false, score: 1 },
                { text: "restrict", correct: false, score: 0 },
                { text: "restart", correct: false, score: 1 }
            ]
        },
        {
            skill: 'reading',
            instruction: '次の文章を読んで、筆者の主張を理解してください。',
            passage: "While remote work offers flexibility and work-life balance, it also presents challenges in team communication and collaboration. Companies must find a balance between these benefits and drawbacks.",
            question: "筆者の主張として最も適切なのは？",
            options: [
                { text: "リモートワークには利点と課題があり、バランスを取る必要がある", correct: true, score: 3 },
                { text: "リモートワークの利点と課題を考慮し、適切なバランスを見つけるべき", correct: false, score: 2 },
                { text: "リモートワークは完全に良い", correct: false, score: 0 },
                { text: "リモートワークは完全に悪い", correct: false, score: 0 }
            ]
        },
        {
            skill: 'reading',
            instruction: '次の文章を読んで、文脈から意味を推測してください。',
            passage: "The new policy has been met with mixed reactions. Some employees welcome the change, while others are skeptical about its effectiveness.",
            question: "mixed reactions の意味として最も適切なのは？",
            options: [
                { text: "賛否両論", correct: true, score: 3 },
                { text: "様々な反応", correct: false, score: 2 },
                { text: "全面的な賛成", correct: false, score: 0 },
                { text: "全面的な反対", correct: false, score: 0 }
            ]
        },
        {
            skill: 'reading',
            instruction: '次の文章を読んで、詳細情報を把握してください。',
            passage: "The annual conference will take place from March 15th to 17th at the Tokyo International Forum. Registration opens on February 1st and closes on March 1st. Early bird registration is available until February 15th with a 20% discount.",
            question: "早期登録の割引率と期限は？",
            options: [
                { text: "20%割引、2月15日まで", correct: true, score: 3 },
                { text: "20%割引、3月1日まで", correct: false, score: 2 },
                { text: "15%割引、2月15日まで", correct: false, score: 1 },
                { text: "15%割引、3月1日まで", correct: false, score: 0 }
            ]
        }
    ],
    speaking: [
        // 簡単（初心者向け）
        {
            skill: 'speaking',
            instruction: '次の状況で、適切な表現を選んでください。',
            scenario: "初めて会う人に挨拶する時、最も適切な表現は？",
            question: "初めて会う人に挨拶する時、何と言いますか？",
            options: [
                { text: "Nice to meet you.", correct: true, score: 3 },
                { text: "Pleased to meet you.", correct: false, score: 2 },
                { text: "Good morning.", correct: false, score: 1 },
                { text: "Goodbye.", correct: false, score: 0 }
            ]
        },
        // 普通（中級者向け）
        {
            skill: 'speaking',
            instruction: '次の状況で、適切な表現を選んでください。',
            scenario: "会議で自分の意見を述べる時、最も適切な表現は？",
            question: "会議で意見を述べる時、何と言いますか？",
            options: [
                { text: "I'd like to share my perspective on this matter.", correct: true, score: 3 },
                { text: "I think so.", correct: false, score: 1 },
                { text: "Yes.", correct: false, score: 0 },
                { text: "OK.", correct: false, score: 0 }
            ]
        },
        {
            skill: 'speaking',
            instruction: '次の状況で、適切な表現を選んでください。',
            scenario: "電話で相手に待ってもらう時、最も適切な表現は？",
            question: "電話で待ってもらう時、何と言いますか？",
            options: [
                { text: "Could you please hold for a moment?", correct: true, score: 3 },
                { text: "Would you mind holding for a moment?", correct: false, score: 2 },
                { text: "One moment, please.", correct: false, score: 1 },
                { text: "Wait.", correct: false, score: 0 }
            ]
        },
        {
            skill: 'speaking',
            instruction: '次の状況で、適切な表現を選んでください。',
            scenario: "プレゼンテーションで質問に答える時、最も適切な表現は？",
            question: "質問に答える時、何と言いますか？",
            options: [
                { text: "That's a great question. Let me address that.", correct: true, score: 3 },
                { text: "That's a good question. Let me explain.", correct: false, score: 2 },
                { text: "I understand your question.", correct: false, score: 1 },
                { text: "I don't know.", correct: false, score: 0 }
            ]
        },
        {
            skill: 'speaking',
            instruction: '次の状況で、適切な表現を選んでください。',
            scenario: "会議で提案をする時、最も適切な表現は？",
            question: "会議で提案をする時、何と言いますか？",
            options: [
                { text: "I'd like to propose that we consider this option.", correct: true, score: 3 },
                { text: "I suggest we consider this option.", correct: false, score: 2 },
                { text: "This is good.", correct: false, score: 1 },
                { text: "I want this.", correct: false, score: 0 }
            ]
        }
    ],
    writing: [
        // 簡単（初心者向け）
        {
            skill: 'writing',
            instruction: '次の文を最も適切な形に書き換えてください。',
            original: "I go to school.",
            question: "過去形にすると？",
            options: [
                { text: "I went to school.", correct: true, score: 3 },
                { text: "I was going to school.", correct: false, score: 2 },
                { text: "I go to school yesterday.", correct: false, score: 1 },
                { text: "I going to school.", correct: false, score: 0 }
            ]
        },
        // 普通（中級者向け）
        {
            skill: 'writing',
            instruction: '次の文を最も適切な形に書き換えてください。',
            original: "Can you send me the report?",
            question: "より丁寧な表現は？",
            options: [
                { text: "Could you please send me the report?", correct: true, score: 3 },
                { text: "Send me the report.", correct: false, score: 0 },
                { text: "I need the report.", correct: false, score: 1 },
                { text: "Report, please.", correct: false, score: 0 }
            ]
        },
        {
            skill: 'writing',
            instruction: '次の文を最も適切な形に書き換えてください。',
            original: "I'm sorry I'm late.",
            question: "より丁寧な表現は？",
            options: [
                { text: "I apologize for being late.", correct: true, score: 3 },
                { text: "I'm sorry for my tardiness.", correct: false, score: 2 },
                { text: "Sorry I'm late.", correct: false, score: 1 },
                { text: "I'm late.", correct: false, score: 0 }
            ]
        },
        // 難しい（上級者向け）
        {
            skill: 'writing',
            instruction: '次の文を最も適切な形に書き換えてください。',
            original: "I want to inform you that the meeting has been cancelled.",
            question: "より丁寧な表現は？",
            options: [
                { text: "I would like to inform you that the meeting has been cancelled.", correct: true, score: 3 },
                { text: "I wish to inform you that the meeting has been cancelled.", correct: false, score: 2 },
                { text: "I want to tell you the meeting is cancelled.", correct: false, score: 1 },
                { text: "The meeting is cancelled.", correct: false, score: 0 }
            ]
        },
        {
            skill: 'writing',
            instruction: '次の文を最も適切な形に書き換えてください。',
            original: "I need this done by Friday.",
            question: "より丁寧な表現は？",
            options: [
                { text: "I would appreciate it if this could be completed by Friday.", correct: true, score: 3 },
                { text: "It would be great if this could be completed by Friday.", correct: false, score: 2 },
                { text: "I want this by Friday.", correct: false, score: 1 },
                { text: "Do this by Friday.", correct: false, score: 0 }
            ]
        }
    ]
};

// コースデータ
const coursesData = {
    travel: {
        name: "旅行英会話コース",
        level: "中級クラス",
        icon: "✈️",
        benefits: [
            "空港でスムーズにチェックイン",
            "レストランで注文やクレーム対応",
            "現地の人と自然な会話",
            "観光地での質問や案内"
        ]
    },
    business: {
        name: "ビジネス英会話コース",
        level: "中級クラス",
        icon: "💼",
        benefits: [
            "会議で意見を述べられる",
            "メールを適切に書ける",
            "プレゼンテーションができる",
            "電話対応がスムーズに"
        ]
    },
    daily: {
        name: "日常英会話コース",
        level: "中級クラス",
        icon: "💬",
        benefits: [
            "自己紹介が自然にできる",
            "買い物やレストランで困らない",
            "道案内ができる",
            "日常的な会話を楽しめる"
        ]
    },
    'study-abroad': {
        name: "留学準備コース",
        level: "中級～上級",
        icon: "🌍",
        benefits: [
            "留学先での生活に必要な英語力",
            "アカデミックな英語表現",
            "現地でのコミュニケーション",
            "文化理解と適応力"
        ]
    },
    presentation: {
        name: "プレゼン・スピーチコース",
        level: "中級～上級",
        icon: "🎤",
        benefits: [
            "効果的なプレゼンテーション",
            "説得力のあるスピーチ",
            "質疑応答への対応",
            "ビジネスシーンでの表現力"
        ]
    },
    meeting: {
        name: "会議・ディスカッションコース",
        level: "中級～上級",
        icon: "📊",
        benefits: [
            "会議での積極的な発言",
            "ディスカッションでの意見交換",
            "交渉力の向上",
            "国際的なビジネスコミュニケーション"
        ]
    },
    career: {
        name: "キャリアアップ英会話コース",
        level: "中級～上級",
        icon: "🚀",
        benefits: [
            "転職・昇進に必要な英語力",
            "面接での自己PR",
            "ビジネス文書の作成",
            "グローバルなキャリア形成"
        ]
    },
    toeic: {
        name: "TOEIC®対策コース",
        level: "全レベル対応",
        icon: "📝",
        benefits: [
            "TOEICスコアアップ",
            "リスニング・リーディング強化",
            "試験対策とテクニック",
            "目標スコア達成"
        ]
    },
    eiken: {
        name: "英検®対策コース",
        level: "全レベル対応",
        icon: "🏆",
        benefits: [
            "英検合格を目指す",
            "4技能すべてを強化",
            "試験対策と過去問演習",
            "目標級の取得"
        ]
    },
    other: {
        name: "総合英会話コース",
        level: "初級～上級",
        icon: "🌟",
        benefits: [
            "様々なシチュエーションに対応",
            "基礎から応用まで学べる",
            "総合的な英語力を向上",
            "自分のペースで学習"
        ]
    }
};

// TOEICスコア計算（各技能のスコアから推定）
function calculateTOEICScore(skillScores) {
    const totalScore = skillScores.listening + skillScores.reading;
    const maxScore = 15; // 各技能5問×3点
    
    // TOEICスコアは495点満点（リスニング）+ 495点満点（リーディング）= 990点満点
    // 簡易計算: スコアを990点に換算
    const listeningScore = Math.round((skillScores.listening / maxScore) * 495);
    const readingScore = Math.round((skillScores.reading / maxScore) * 495);
    const totalTOEIC = listeningScore + readingScore;
    
    return {
        listening: listeningScore,
        reading: readingScore,
        total: totalTOEIC
    };
}

// 英検級判定（より厳しい基準）
function calculateEikenLevel(toeicScore) {
    if (toeicScore >= 900) {
        return { level: "1級", description: "大学上級程度" };
    } else if (toeicScore >= 800) {
        return { level: "準1級", description: "大学中級程度" };
    } else if (toeicScore >= 650) {
        return { level: "2級", description: "高校卒業程度" };
    } else if (toeicScore >= 500) {
        return { level: "準2級", description: "高校中級程度" };
    } else if (toeicScore >= 350) {
        return { level: "3級", description: "中学卒業程度" };
    } else if (toeicScore >= 250) {
        return { level: "4級", description: "中学中級程度" };
    } else {
        return { level: "5級", description: "中学初級程度" };
    }
}

// CEFRレベル判定
function calculateCEFRLevel(toeicScore) {
    if (toeicScore >= 945) {
        return { level: "C2", description: "Mastery（熟達）" };
    } else if (toeicScore >= 785) {
        return { level: "C1", description: "Effective Operational Proficiency（効果的な運用能力）" };
    } else if (toeicScore >= 550) {
        return { level: "B2", description: "Vantage（高級）" };
    } else if (toeicScore >= 225) {
        return { level: "B1", description: "Threshold（中級）" };
    } else if (toeicScore >= 120) {
        return { level: "A2", description: "Waystage（初級）" };
    } else {
        return { level: "A1", description: "Breakthrough（入門）" };
    }
}

// 総合レベル判定（より厳しい基準）
function calculateOverallLevel(skillScores) {
    const totalScore = skillScores.listening + skillScores.reading + skillScores.speaking + skillScores.writing;
    const maxScore = 60; // 各技能5問×3点×4技能
    
    // より厳しい基準に変更
    if (totalScore >= 52) {
        return {
            japanese: "上級",
            english: "Advanced",
            stars: 5
        };
    } else if (totalScore >= 42) {
        return {
            japanese: "中級〜上級",
            english: "Intermediate-Advanced",
            stars: 4
        };
    } else if (totalScore >= 30) {
        return {
            japanese: "中級",
            english: "Intermediate",
            stars: 3
        };
    } else if (totalScore >= 18) {
        return {
            japanese: "初級〜中級",
            english: "Beginner-Intermediate",
            stars: 2
        };
    } else {
        return {
            japanese: "初級",
            english: "Beginner",
            stars: 1
        };
    }
}

// 弱い技能を特定してアドバイスを生成
function generateAdvice(skillScores) {
    const maxScore = 15; // 各技能5問×3点
    const skillNames = {
        listening: { name: 'リスニング', icon: '🎧' },
        reading: { name: 'リーディング', icon: '📖' },
        speaking: { name: 'スピーキング', icon: '🗣️' },
        writing: { name: 'ライティング', icon: '✍️' }
    };
    
    // 各技能のスコアを配列に変換
    const skillArray = Object.keys(skillScores).map(skill => ({
        id: skill,
        name: skillNames[skill].name,
        icon: skillNames[skill].icon,
        score: skillScores[skill],
        percentage: (skillScores[skill] / maxScore) * 100
    }));
    
    // スコアが低い順にソート
    skillArray.sort((a, b) => a.score - b.score);
    
    // 最も低い技能を特定（60%未満を「弱い」とする）
    const weakSkills = skillArray.filter(skill => skill.percentage < 60);
    
    if (weakSkills.length > 0) {
        const weakestSkill = weakSkills[0];
        const adviceMessages = {
            listening: `🎧 リスニング力を伸ばしましょう！\n英語の音声に慣れることで、会話力が大きく向上します。\n当校のリスニング強化コースで、実践的な聞き取り力を身につけましょう！`,
            reading: `📖 リーディング力を伸ばしましょう！\n文章を読むことで語彙力と理解力が向上します。\n当校のリーディング強化コースで、長文読解力を身につけましょう！`,
            speaking: `🗣️ スピーキング力を伸ばしましょう！\n実際に話す練習で、自信を持って英語を話せるようになります。\n当校のスピーキング強化コースで、自然な会話力を身につけましょう！`,
            writing: `✍️ ライティング力を伸ばしましょう！\n文章を書くことで、正確な英語表現が身につきます。\n当校のライティング強化コースで、ビジネス文書も書けるようになりましょう！`
        };
        
        return {
            hasWeakSkill: true,
            skill: weakestSkill,
            message: adviceMessages[weakestSkill.id]
        };
    } else {
        // すべての技能がバランスよくできている場合
        const highestSkill = skillArray[skillArray.length - 1];
        return {
            hasWeakSkill: false,
            skill: highestSkill,
            message: `素晴らしいバランスです！\n${highestSkill.name}が特に得意ですね。\nさらに上を目指して、総合的な英語力を高めていきましょう！`
        };
    }
}

// 音声再生機能
let currentUtterance = null;
let isAudioInitialized = false;

// 音声合成の初期化（Edge対応）
function initializeAudio() {
    if ('speechSynthesis' in window && !isAudioInitialized) {
        // Edge/Chromeで音声合成を初期化するために、空の音声を一度再生
        const initUtterance = new SpeechSynthesisUtterance('');
        initUtterance.volume = 0;
        window.speechSynthesis.speak(initUtterance);
        window.speechSynthesis.cancel();
        isAudioInitialized = true;
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', function() {
    // 少し遅延して初期化（Edge対応）
    setTimeout(function() {
        initializeAudio();
    }, 500);
});

function playAudio(text, button) {
    // ボタンの状態を更新
    const originalText = button.textContent;
    button.textContent = '⏸️ 再生中...';
    button.classList.add('playing');
    button.disabled = true;
    
    // ブラウザの音声合成APIを使用
    if ('speechSynthesis' in window) {
        // 音声合成を初期化（Edge対応）
        initializeAudio();
        
        // 既存の音声を停止
        window.speechSynthesis.cancel();
        
        // Edge/Chromeで確実に動作するように、少し待ってから再生
        setTimeout(function() {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                utterance.rate = 0.85; // 少しゆっくりめ（リスニング用）
                utterance.pitch = 1;
                utterance.volume = 1;
                
                currentUtterance = utterance;
                
                let isPlaying = false;
                let timeoutId = null;
                
                utterance.onstart = function() {
                    isPlaying = true;
                    console.log('音声再生開始');
                    // タイムアウトをクリア
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                };
                
                utterance.onend = function() {
                    isPlaying = false;
                    button.textContent = originalText;
                    button.classList.remove('playing');
                    button.disabled = false;
                    currentUtterance = null;
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                };
                
                utterance.onerror = function(event) {
                    isPlaying = false;
                    button.textContent = originalText;
                    button.classList.remove('playing');
                    button.disabled = false;
                    currentUtterance = null;
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    
                    console.error('音声再生エラー:', event);
                    
                    // エラーの種類に応じたメッセージ
                    let errorMsg = '音声の再生に失敗しました。';
                    if (event.error === 'not-allowed') {
                        errorMsg += '\n\n【対処法】\n1. ブラウザの設定で音声合成を許可してください\n2. ページをリロードして再試行してください';
                    } else if (event.error === 'network') {
                        errorMsg += '\nネットワークエラーが発生しました。';
                    } else if (event.error === 'synthesis-failed') {
                        errorMsg += '\n音声合成エンジンの問題です。\nページをリロードして再試行してください。';
                    } else {
                        errorMsg += '\n\n【対処法】\n1. Edgeを最新版に更新してください\n2. ページをリロードして再試行してください\n3. 他のブラウザ（Chrome）でもお試しください';
                    }
                    alert(errorMsg);
                };
                
                // 音声再生
                window.speechSynthesis.speak(utterance);
                
                // 3秒後に再生が開始されていない場合のタイムアウト
                timeoutId = setTimeout(function() {
                    if (!isPlaying && currentUtterance === utterance) {
                        // 再生が開始されていない
                        window.speechSynthesis.cancel();
                        button.textContent = originalText;
                        button.classList.remove('playing');
                        button.disabled = false;
                        currentUtterance = null;
                        
                        // 再試行を促す
                        if (confirm('音声の再生が開始されませんでした。\nもう一度お試ししますか？')) {
                            playAudio(text, button);
                        }
                    }
                }, 3000);
                
            } catch (error) {
                console.error('音声再生エラー:', error);
                button.textContent = originalText;
                button.classList.remove('playing');
                button.disabled = false;
                alert('音声の再生に失敗しました。\n\n【対処法】\n1. Edgeを最新版に更新してください\n2. ページをリロードして再試行してください\n3. 他のブラウザ（Chrome）でもお試しください');
            }
        }, 200); // Edge対応で少し長めに待つ
        
    } else {
        button.textContent = originalText;
        button.classList.remove('playing');
        button.disabled = false;
        alert('お使いのブラウザでは音声再生機能がサポートされていません。\nEdgeを最新版に更新するか、Chrome、Safariなどの最新ブラウザをご使用ください。');
    }
}

// 診断結果ID生成（要件定義書に基づく: LVL-{YYYYMMDD}-{ランダム6文字英数字}）
function generateResultId() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `LVL-${dateStr}-${randomStr}`;
}

// 用途選択のイベントハンドラー（グローバル関数）
function setupPurposeCardHandlers() {
    console.log('[STEP 1] Setting up purpose card handlers - 開始');
    
    // まず、purpose-screenが存在するか確認
    const purposeScreen = document.getElementById('purpose-screen');
    if (!purposeScreen) {
        console.error('[STEP 1-ERROR] purpose-screen要素が見つかりません');
        return;
    }
    console.log('[STEP 1-OK] purpose-screen要素を発見');
    
    // カード要素を検索
    const cards = document.querySelectorAll('.purpose-card');
    console.log('[STEP 2] カード要素を検索:', cards.length, '個見つかりました');
    
    if (cards.length === 0) {
        console.error('[STEP 2-ERROR] purpose-card要素が見つかりません');
        return;
    }
    
    // 既存のイベントリスナーを削除するため、カードをクローン
    console.log('[STEP 3] 既存のイベントリスナーを削除（クローン方式）');
    cards.forEach((card, index) => {
        const parent = card.parentNode;
        if (parent) {
            const newCard = card.cloneNode(true);
            parent.replaceChild(newCard, card);
            console.log(`[STEP 3] カード ${index + 1} をクローンしました`);
        }
    });
    
    // 再度カードを取得（クローン後の要素）
    const newCards = document.querySelectorAll('.purpose-card');
    console.log('[STEP 4] クローン後のカード要素を取得:', newCards.length, '個');
    
    // 各カードに直接イベントリスナーを設定
    console.log('[STEP 5] 各カードにイベントリスナーを設定');
    newCards.forEach((card, index) => {
        const purpose = card.dataset.purpose;
        console.log(`[STEP 5] カード ${index + 1}: data-purpose="${purpose}"`);
        
        card.addEventListener('click', function(e) {
            console.log('[CLICK] カードがクリックされました:', purpose);
            
            e.preventDefault();
            e.stopPropagation();
            
            if (!purpose) {
                console.error('[CLICK-ERROR] No purpose data attribute found');
                return;
            }
            
            if (!window.selectedPurposes) {
                window.selectedPurposes = [];
            }
            
            if (window.selectedPurposes.includes(purpose)) {
                window.selectedPurposes = window.selectedPurposes.filter(p => p !== purpose);
                this.classList.remove('selected');
                console.log('[CLICK] 選択解除:', purpose, '現在の選択:', window.selectedPurposes);
            } else {
                window.selectedPurposes.push(purpose);
                this.classList.add('selected');
                console.log('[CLICK] 選択:', purpose, '現在の選択:', window.selectedPurposes);
            }
            
            const nextBtn = document.getElementById('purpose-next-btn');
            if (nextBtn) {
                nextBtn.disabled = window.selectedPurposes.length === 0;
                console.log('[CLICK] 次へボタンの状態:', nextBtn.disabled ? '無効' : '有効');
            }
        }, true); // capture phaseで確実に捕捉
        
        console.log(`[STEP 5-OK] カード ${index + 1} にイベントリスナーを設定しました`);
    });
    
    console.log('[STEP 6] Purpose card handlers setup complete - 完了');
}

// 画面遷移
function showScreen(screenId) {
    console.log('画面遷移:', screenId);
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('画面遷移成功:', screenId);
        
        // purpose-screenが表示された時にイベントリスナーを再設定
        if (screenId === 'purpose-screen') {
            console.log('[showScreen] purpose-screen表示を検出、イベントリスナーを設定します...');
            // DOMが完全に更新されるまで待つ
            setTimeout(function() {
                console.log('[showScreen] 遅延後にsetupPurposeCardHandlersを呼び出します');
                setupPurposeCardHandlers();
            }, 300);
        }
    } else {
        console.error('画面が見つかりません:', screenId);
    }
}

// グローバル変数（診断方法）
// selectedMethodとselectedLevelはindex.htmlで定義されている
// ここでは宣言せず、既存のグローバル変数を使用する

// 診断開始ボタンのハンドラー（グローバル関数として定義）
function handleStartClick(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log('診断開始ボタンがクリックされました（インライン）');
    showScreen('method-screen');
    return false;
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: イベントリスナーを設定します');
    
    // ランディング画面
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        console.log('start-btnが見つかりました');
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('診断開始ボタンがクリックされました（イベントリスナー）');
            showScreen('method-screen');
            return false;
        });
    } else {
        console.error('start-btnが見つかりません');
    }
    
    // 診断方法選択
    const levelSelectMethod = document.getElementById('level-select-method');
    if (levelSelectMethod) {
        levelSelectMethod.addEventListener('click', function(e) {
            // ボタンがクリックされた場合も処理する
            if (e.target.tagName === 'BUTTON') {
                e.stopPropagation();
            }
            console.log('レベル選択診断が選択されました');
            selectedMethod = 'level-select';
            showScreen('level-select-screen');
        });
        
        // ボタンにも直接イベントリスナーを設定
        const levelSelectBtn = levelSelectMethod.querySelector('.method-btn');
        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('レベル選択診断ボタンがクリックされました');
                selectedMethod = 'level-select';
                showScreen('level-select-screen');
            });
        }
    } else {
        console.error('level-select-methodが見つかりません');
    }
    
    const autoMethod = document.getElementById('auto-method');
    if (autoMethod) {
        autoMethod.addEventListener('click', function(e) {
            // ボタンがクリックされた場合も処理する
            if (e.target.tagName === 'BUTTON') {
                e.stopPropagation();
            }
            console.log('自動判定診断が選択されました');
            selectedMethod = 'auto';
            selectedLevel = null;
            showScreen('purpose-screen');
        });
        
        // ボタンにも直接イベントリスナーを設定
        const autoMethodBtn = autoMethod.querySelector('.method-btn');
        if (autoMethodBtn) {
            autoMethodBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('自動判定診断ボタンがクリックされました');
                selectedMethod = 'auto';
                selectedLevel = null;
                showScreen('purpose-screen');
            });
        }
    } else {
        console.error('auto-methodが見つかりません');
    }
    
    // レベル選択画面
    document.querySelectorAll('.level-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedLevel = this.dataset.level;
            
            // 少し待ってから用途選択画面へ
            setTimeout(() => {
                showScreen('purpose-screen');
            }, 300);
        });
    });
    
    document.getElementById('level-back-btn').addEventListener('click', function() {
        showScreen('method-screen');
    });

    // 用途選択のイベントリスナーを初期設定（画面遷移時にも再設定される）
    // 初期ロード時にも設定を試みる
    if (document.getElementById('purpose-screen')) {
        console.log('[DOMContentLoaded] 初期ロード時にsetupPurposeCardHandlersを呼び出します');
        setupPurposeCardHandlers();
    }

    document.getElementById('purpose-next-btn').addEventListener('click', function() {
        if (!window.selectedPurposes) {
            window.selectedPurposes = [];
        }
        if (window.selectedPurposes.length > 0) {
            startQuiz();
        }
    });

    // 診断画面
    document.getElementById('skip-btn').addEventListener('click', function() {
        if (currentQuestionIndex < diagnosisSkills.length) {
            const currentQuestionData = diagnosisSkills[currentQuestionIndex];
            handleAnswer(null, currentQuestionData.skillId);
        }
    });

    // 問い合わせフォーム
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            showScreen('complete-screen');
        }
    });

    // 送信完了画面
    document.getElementById('home-btn').addEventListener('click', function() {
        // リセット
        window.selectedPurposes = [];
        currentSkillIndex = 0;
        currentQuestionIndex = 0;
        skillAnswers = {
            listening: [],
            reading: [],
            speaking: [],
            writing: []
        };
        resultData = null;
        showScreen('landing-screen');
    });

    // メール送信ボタン（デモ用）
    document.getElementById('email-btn').addEventListener('click', function() {
        alert('デモ版ではメール送信機能は実装されていません。\n実際のバージョンでは診断結果をメールで送信します。');
    });

    // コピーボタン
    document.getElementById('copy-btn').addEventListener('click', function() {
        const resultId = document.getElementById('result-id').textContent;
        navigator.clipboard.writeText(resultId).then(function() {
            alert('診断結果IDをコピーしました: ' + resultId);
        });
    });
    
    // 問い合わせ画面へ
    document.getElementById('contact-btn').addEventListener('click', function() {
        showScreen('contact-screen');
    });
    
    // 無料体験レッスン・カウンセリングボタン
    const trialLessonBtn = document.getElementById('trial-lesson-btn');
    if (trialLessonBtn) {
        trialLessonBtn.addEventListener('click', function() {
            // 問い合わせフォームに「無料体験レッスン予約」を設定
            document.getElementById('inquiry-type').value = 'trial-lesson';
            showScreen('contact-screen');
        });
    }
    
    const counselingBtn = document.getElementById('counseling-btn');
    if (counselingBtn) {
        counselingBtn.addEventListener('click', function() {
            // 問い合わせフォームに「無料カウンセリング予約」を設定
            document.getElementById('inquiry-type').value = 'counseling';
            showScreen('contact-screen');
        });
    }
});

// 診断開始
function startQuiz() {
    currentSkillIndex = 0;
    currentQuestionIndex = 0;
    skillAnswers = {
        listening: [],
        reading: [],
        speaking: [],
        writing: []
    };
    
    // 診断方法に応じた問題セットを取得
    const questionsSet = getQuestionsForDiagnosis();
    diagnosisQuestions = questionsSet;
    
    // 技能リストを構築（すべての診断方法で統一）
    diagnosisSkills = [];
    Object.keys(questionsSet).forEach(skillId => {
        if (questionsSet[skillId] && Array.isArray(questionsSet[skillId])) {
            questionsSet[skillId].forEach((q, idx) => {
                diagnosisSkills.push({
                    skillId: skillId,
                    questionIndex: idx,
                    question: q
                });
            });
        }
    });
    
    // 問題をランダムにシャッフル（初級・中級の場合のみ）
    if (selectedMethod === 'level-select' && (selectedLevel === 'beginner' || selectedLevel === 'intermediate')) {
        diagnosisSkills = diagnosisSkills.sort(() => Math.random() - 0.5);
    }
    
    showScreen('quiz-screen');
    loadQuestion();
}

// 診断方法に応じた問題数を取得
function getTotalQuestions() {
    if (selectedMethod === 'auto') {
        return 20; // 4技能 × 5問
    } else if (selectedMethod === 'level-select') {
        if (selectedLevel === 'beginner') {
            return 5;
        } else if (selectedLevel === 'intermediate') {
            return 10;
        } else if (selectedLevel === 'advanced') {
            return 20;
        }
    }
    return 20; // デフォルト
}

// 診断方法に応じた問題を取得
function getQuestionsForDiagnosis() {
    if (selectedMethod === 'auto') {
        // 自動判定: 4技能 × 5問（各技能から5問ずつ）
        return {
            listening: questionsData.listening.slice(0, 5),
            reading: questionsData.reading.slice(0, 5),
            speaking: questionsData.speaking.slice(0, 5),
            writing: questionsData.writing.slice(0, 5)
        };
    } else if (selectedMethod === 'level-select') {
        // レベル選択: 選択したレベルに応じた問題数
        if (selectedLevel === 'beginner') {
            // 初級: 5問（簡単な問題から、各技能から1問ずつ、残り1問はリスニングから）
            return {
                listening: questionsData.listening.slice(0, 2), // 2問
                reading: questionsData.reading.slice(0, 1), // 1問
                speaking: questionsData.speaking.slice(0, 1), // 1問
                writing: questionsData.writing.slice(0, 1) // 1問
            };
        } else if (selectedLevel === 'intermediate') {
            // 中級: 10問（簡単～普通の問題から、各技能から2問ずつ、残り2問はリスニングとリーディングから）
            return {
                listening: questionsData.listening.slice(0, 3), // 3問
                reading: questionsData.reading.slice(0, 3), // 3問
                speaking: questionsData.speaking.slice(0, 2), // 2問
                writing: questionsData.writing.slice(0, 2) // 2問
            };
        } else if (selectedLevel === 'advanced') {
            // 上級: 20問（4技能 × 5問）
            return {
                listening: questionsData.listening.slice(0, 5),
                reading: questionsData.reading.slice(0, 5),
                speaking: questionsData.speaking.slice(0, 5),
                writing: questionsData.writing.slice(0, 5)
            };
        }
    }
    // デフォルト: 自動判定と同じ
    return {
        listening: questionsData.listening.slice(0, 5),
        reading: questionsData.reading.slice(0, 5),
        speaking: questionsData.speaking.slice(0, 5),
        writing: questionsData.writing.slice(0, 5)
    };
}

// 問題読み込み
function loadQuestion() {
    if (currentQuestionIndex >= diagnosisSkills.length) {
        // 全問題終了
        showResult();
        return;
    }
    
    const currentQuestionData = diagnosisSkills[currentQuestionIndex];
    const question = currentQuestionData.question;
    const skillId = currentQuestionData.skillId;
    const currentSkill = skills.find(s => s.id === skillId) || { name: '総合', icon: '📝' };
    
    // 進捗バー更新
    const totalQuestions = getTotalQuestions();
    const currentQuestionNumber = currentQuestionIndex + 1;
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('quiz-progress').style.width = progress + '%';
    
    // ステップ表示更新
    if (selectedMethod === 'auto') {
        // 自動判定: 技能名を表示
        document.getElementById('quiz-step').textContent = `${currentSkill.name} ${currentSkill.icon}`;
    } else {
        // レベル選択: ステップのみ表示
        document.getElementById('quiz-step').textContent = `ステップ ${currentQuestionNumber}/${totalQuestions}`;
    }
    document.getElementById('question-number').textContent = `問題 ${currentQuestionNumber}/${totalQuestions}`;
    
    // 問題表示
    const questionContainer = document.querySelector('.question-container');
    let questionHTML = '';
    
    if (question.instruction) {
        questionHTML += `<div class="question-instruction">${question.instruction}</div>`;
    }
    
    if (question.audioText) {
        const audioTextEscaped = question.audioText.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        questionHTML += `
            <div class="audio-player">
                <div class="audio-instruction">音声を聞いて、問題に答えてください</div>
                <button class="btn-play-audio" data-audio-text="${audioTextEscaped}">
                    🔊 音声を再生
                </button>
                <div class="audio-note">※音声は何度でも再生できます</div>
            </div>
        `;
    }
    
    if (question.passage) {
        questionHTML += `<div class="passage-text">${question.passage}</div>`;
    }
    
    if (question.original) {
        questionHTML += `<div class="original-text">原文: "${question.original}"</div>`;
    }
    
    if (question.scenario) {
        questionHTML += `<div class="scenario-text">${question.scenario}</div>`;
    }
    
    questionHTML += `<div class="question-scenario">${question.question}</div>`;
    
    document.getElementById('question-text').innerHTML = questionHTML;
    
    // 音声再生ボタンのイベントリスナー
    const audioButton = document.querySelector('.btn-play-audio');
    if (audioButton) {
        audioButton.addEventListener('click', function() {
            const audioText = this.getAttribute('data-audio-text');
            playAudio(audioText, this);
        });
    }
    
    // 選択肢をランダムにシャッフル
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    // 選択肢表示
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    shuffledOptions.forEach((option, index) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'option-card';
        optionCard.textContent = option.text;
        optionCard.dataset.optionIndex = question.options.indexOf(option); // 元のインデックスを保存
        optionCard.addEventListener('click', function() {
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.classList.add('selected');
            document.getElementById('quiz-next-btn').disabled = false;
        });
        optionsContainer.appendChild(optionCard);
    });
    
    // 次へボタンを無効化
    document.getElementById('quiz-next-btn').disabled = true;
    
    // 次へボタンのイベント
    const nextBtn = document.getElementById('quiz-next-btn');
    nextBtn.onclick = function() {
        const selectedOption = document.querySelector('.option-card.selected');
        if (selectedOption) {
            const originalIndex = parseInt(selectedOption.dataset.optionIndex);
            handleAnswer(question.options[originalIndex], skillId);
        }
    };
}

// 回答処理
function handleAnswer(selectedOption, skillId) {
    if (selectedOption) {
        if (!skillAnswers[skillId]) {
            skillAnswers[skillId] = [];
        }
        skillAnswers[skillId].push(selectedOption.score);
    } else {
        if (!skillAnswers[skillId]) {
            skillAnswers[skillId] = [];
        }
        skillAnswers[skillId].push(0); // スキップ
    }
    
    currentQuestionIndex++;
    
    // 次の問題へ
    if (currentQuestionIndex < diagnosisSkills.length) {
        loadQuestion();
    } else {
        // 全問題終了
        showResult();
    }
}

// 結果表示
function showResult() {
    // 各技能のスコア計算（回答がない場合は0）
    const skillScores = {
        listening: (skillAnswers.listening || []).reduce((sum, score) => sum + score, 0),
        reading: (skillAnswers.reading || []).reduce((sum, score) => sum + score, 0),
        speaking: (skillAnswers.speaking || []).reduce((sum, score) => sum + score, 0),
        writing: (skillAnswers.writing || []).reduce((sum, score) => sum + score, 0)
    };
    
    // 総合スコア計算（診断方法に応じて）
    const totalQuestions = getTotalQuestions();
    let totalScore = 0;
    Object.keys(skillScores).forEach(skill => {
        totalScore += skillScores[skill];
    });
    
    // 最大スコアを計算（各問題3点満点）
    const maxScore = totalQuestions * 3;
    
    // 総合レベル判定（診断方法に応じて調整）
    let overallLevel;
    if (selectedMethod === 'auto') {
        // 自動判定: 4技能すべてを使用
        overallLevel = calculateOverallLevel(skillScores);
    } else {
        // レベル選択: 簡易的な判定
        const percentage = (totalScore / maxScore) * 100;
        if (percentage >= 80) {
            overallLevel = { japanese: "上級", english: "Advanced", stars: 5 };
        } else if (percentage >= 60) {
            overallLevel = { japanese: "中級", english: "Intermediate", stars: 3 };
        } else if (percentage >= 40) {
            overallLevel = { japanese: "初級～中級", english: "Beginner-Intermediate", stars: 2 };
        } else {
            overallLevel = { japanese: "初級", english: "Beginner", stars: 1 };
        }
    }
    
    // TOEICスコア計算（自動判定のみ）
    let toeicScore = null;
    let eikenLevel = null;
    let cefrLevel = null;
    if (selectedMethod === 'auto') {
        toeicScore = calculateTOEICScore(skillScores);
        eikenLevel = calculateEikenLevel(toeicScore.total);
        cefrLevel = calculateCEFRLevel(toeicScore.total);
    }
    
    const mainPurpose = (window.selectedPurposes && window.selectedPurposes[0]) || 'other';
    const course = coursesData[mainPurpose] || coursesData.other;
    const resultId = generateResultId();
    
    resultData = {
        level: overallLevel,
        skillScores: skillScores,
        totalScore: totalScore,
        maxScore: totalQuestions,
        toeic: toeicScore,
        eiken: eikenLevel,
        cefr: cefrLevel,
        course: course,
        resultId: resultId
    };
    
    // モチベーション向上のメッセージ
    const motivationalMessages = {
        1: "素晴らしいスタートです！これから一緒に英語力を伸ばしていきましょう！",
        2: "良い基礎ができています！次のステップに進みましょう！",
        3: "しっかりとした英語力があります！さらに上を目指しましょう！",
        4: "高い英語力を持っています！実践的な場面で活かしていきましょう！",
        5: "素晴らしい英語力です！さらに磨きをかけて、ネイティブレベルを目指しましょう！"
    };
    
    // 診断結果IDを最上部に表示（要件定義書に基づく）
    const resultScreen = document.getElementById('result-screen');
    const container = resultScreen.querySelector('.container');
    
    // 既存の診断結果IDセクション（最上部）を削除
    const existingResultIdTop = document.querySelector('.result-id-section-top');
    if (existingResultIdTop) {
        existingResultIdTop.remove();
    }
    
    // 最上部に診断結果IDセクションを追加
    const resultIdHTML = `
        <div class="result-id-section-top">
            <h3>📋 診断結果ID</h3>
            <div class="result-id-display">
                <span id="result-id-top" style="font-size: 24px; font-weight: bold; color: #FF6B6B; letter-spacing: 2px; font-family: monospace;">${resultId}</span>
                <button class="btn-copy" id="copy-btn-top">📋 コピー</button>
            </div>
            <p class="result-id-note">※来校時にこのIDを提示してください<br>※有効期限: 90日間</p>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', resultIdHTML);
    
    // コピーボタンのイベントリスナー（最上部）
    const copyBtnTop = document.getElementById('copy-btn-top');
    if (copyBtnTop) {
        copyBtnTop.addEventListener('click', function() {
            const resultIdText = document.getElementById('result-id-top').textContent;
            navigator.clipboard.writeText(resultIdText).then(function() {
                alert('診断結果IDをコピーしました: ' + resultIdText);
            });
        });
    }
    
    // 結果画面に表示
    document.getElementById('stars-display').textContent = '⭐'.repeat(overallLevel.stars) + '☆'.repeat(5 - overallLevel.stars);
    document.getElementById('level-japanese').textContent = overallLevel.japanese;
    document.getElementById('level-english').textContent = `(${overallLevel.english})`;
    document.getElementById('course-icon').textContent = course.icon;
    document.getElementById('course-name').textContent = course.name;
    document.getElementById('course-level').textContent = `(${course.level})`;
    document.getElementById('result-id').textContent = resultId;
    
    // 総合スコア表示を追加（最大スコアを正しく計算）
    const resultCard = document.querySelector('.result-card');
    const maxScoreForDisplay = totalQuestions * 3; // 各問題3点満点
    const totalScoreHTML = `
        <div class="total-score-section">
            <h4>総合スコア: ${totalScore}/${maxScoreForDisplay}点</h4>
        </div>
    `;
    if (!document.querySelector('.total-score-section')) {
        resultCard.insertAdjacentHTML('afterbegin', totalScoreHTML);
    } else {
        document.querySelector('.total-score-section h4').textContent = `総合スコア: ${totalScore}/${maxScoreForDisplay}点`;
    }
    
    // モチベーションメッセージを追加
    const motivationalMessage = motivationalMessages[overallLevel.stars] || motivationalMessages[3];
    if (!document.querySelector('.motivational-message')) {
        const messageHTML = `<div class="motivational-message">${motivationalMessage}</div>`;
        resultCard.insertAdjacentHTML('afterbegin', messageHTML);
    }
    
    // できることリスト
    const benefitsList = document.getElementById('benefits-list');
    benefitsList.innerHTML = '';
    course.benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit;
        benefitsList.appendChild(li);
    });
    
    // アドバイス生成（自動判定のみ、またはフェーズ2以降）
    let advice = null;
    if (selectedMethod === 'auto') {
        advice = generateAdvice(skillScores);
    }
    
    // 4技能スコア表示とレベル認定（自動判定の場合のみ表示）
    let skillScoresHTML = '';
    if (selectedMethod === 'auto') {
        const maxScorePerSkill = 5; // 自動判定: 各技能5問×3点 = 15点満点だが、表示は5点満点
        skillScoresHTML = `
            <div class="skill-scores-section">
                <h4>4技能スコア</h4>
                <div class="skill-scores-grid">
                    <div class="skill-score-item">
                        <span class="skill-icon">🎧</span>
                        <span class="skill-name">リスニング</span>
                        <span class="skill-score">${Math.min(Math.ceil(skillScores.listening / 3), maxScorePerSkill)}/${maxScorePerSkill}</span>
                    </div>
                    <div class="skill-score-item">
                        <span class="skill-icon">📖</span>
                        <span class="skill-name">リーディング</span>
                        <span class="skill-score">${Math.min(Math.ceil(skillScores.reading / 3), maxScorePerSkill)}/${maxScorePerSkill}</span>
                    </div>
                    <div class="skill-score-item">
                        <span class="skill-icon">🗣️</span>
                        <span class="skill-name">スピーキング</span>
                        <span class="skill-score">${Math.min(Math.ceil(skillScores.speaking / 3), maxScorePerSkill)}/${maxScorePerSkill}</span>
                    </div>
                    <div class="skill-score-item">
                        <span class="skill-icon">✍️</span>
                        <span class="skill-name">ライティング</span>
                        <span class="skill-score">${Math.min(Math.ceil(skillScores.writing / 3), maxScorePerSkill)}/${maxScorePerSkill}</span>
                    </div>
                </div>
            </div>
            
            <div class="level-certifications">
                <h4>レベル認定</h4>
                <div class="certification-item">
                    <span class="cert-label">TOEIC:</span>
                    <span class="cert-value">${toeicScore.total}点 (L:${toeicScore.listening} R:${toeicScore.reading})</span>
                </div>
                <div class="certification-item">
                    <span class="cert-label">英検:</span>
                    <span class="cert-value">${eikenLevel.level} (${eikenLevel.description})</span>
                </div>
                <div class="certification-item">
                    <span class="cert-label">CEFR:</span>
                    <span class="cert-value">${cefrLevel.level} (${cefrLevel.description})</span>
                </div>
            </div>
        `;
        
        if (advice) {
            skillScoresHTML += `
                <div class="advice-section">
                    <h4>📝 あなたへのアドバイス</h4>
                    <div class="advice-message">${advice.message}</div>
                </div>
            `;
        }
    }
    
    // 結果画面に4技能スコアとレベル認定を追加（自動判定の場合のみ）
    if (selectedMethod === 'auto' && !document.querySelector('.skill-scores-section')) {
        resultCard.insertAdjacentHTML('beforeend', skillScoresHTML);
    } else if (selectedMethod !== 'auto') {
        // レベル選択の場合、既存のセクションを削除
        const existingSection = document.querySelector('.skill-scores-section');
        if (existingSection) {
            existingSection.remove();
        }
        const existingCert = document.querySelector('.level-certifications');
        if (existingCert) {
            existingCert.remove();
        }
    }
    
    // AIアプリで続かなかった人へのメッセージ（条件付き表示）
    // 用途選択で「AIアプリを試したけど続かなかった」を選んだ場合のみ表示
    // または、ランディング画面の1.3セクションから診断を開始した場合に表示
    const shouldShowAiAppMessage = window.selectedPurposes && window.selectedPurposes.includes('ai-app-failed');
    
    if (shouldShowAiAppMessage) {
        const aiAppMessageHTML = `
            <div class="ai-app-result-section">
                <h4>💡 対面レッスンがおすすめ！</h4>
                <p class="ai-app-intro">AIアプリで続かなかったあなた。<br>対面レッスンなら変わる理由がある</p>
                <div class="ai-app-benefits">
                    <div>✨ 仲間と一緒に学べる</div>
                    <div>✨ モチベーションが維持できる</div>
                    <div>✨ リアルな反応で成長を実感</div>
                </div>
                <div class="ai-app-stats">
                    <p><strong>継続率:</strong> AIアプリ 20% → 対面 85%</p>
                    <p><strong>モチベーション:</strong> AIアプリ 30% → 対面 90%</p>
                </div>
                <button class="btn-primary ai-app-cta">無料体験レッスンを予約する</button>
            </div>
        `;
        
        // 結果画面にAIアプリメッセージを追加（CTAセクションの前に）
        if (!document.querySelector('.ai-app-result-section')) {
            resultCard.insertAdjacentHTML('beforeend', aiAppMessageHTML);
            
            // AIアプリメッセージ内のCTAボタンのイベントリスナー
            const aiAppCtaBtn = document.querySelector('.ai-app-cta');
            if (aiAppCtaBtn) {
                aiAppCtaBtn.addEventListener('click', function() {
                    document.getElementById('inquiry-type').value = 'trial-lesson';
                    showScreen('contact-screen');
                });
            }
        }
    }
    
    // 問い合わせフォームにIDを設定
    document.getElementById('result-id-input').value = resultId;
    
    // 既存の診断結果IDセクションを非表示（最上部に表示するため）
    const existingResultIdSection = document.querySelector('.result-id-section');
    if (existingResultIdSection) {
        existingResultIdSection.style.display = 'none';
    }
    
    showScreen('result-screen');
}

// フォームバリデーション
function validateForm() {
    let isValid = true;
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // 名前のバリデーション
    if (name === '') {
        document.getElementById('name-error').textContent = 'お名前を入力してください';
        isValid = false;
    } else {
        document.getElementById('name-error').textContent = '';
    }
    
    // メールアドレスのバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        document.getElementById('email-error').textContent = 'メールアドレスを入力してください';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        document.getElementById('email-error').textContent = '正しいメールアドレスを入力してください';
        isValid = false;
    } else {
        document.getElementById('email-error').textContent = '';
    }
    
    // 電話番号のバリデーション
    const phoneRegex = /^[\d-]+$/;
    if (phone === '') {
        document.getElementById('phone-error').textContent = '電話番号を入力してください';
        isValid = false;
    } else if (!phoneRegex.test(phone.replace(/-/g, ''))) {
        document.getElementById('phone-error').textContent = '正しい電話番号を入力してください';
        isValid = false;
    } else {
        document.getElementById('phone-error').textContent = '';
    }
    
    return isValid;
}
