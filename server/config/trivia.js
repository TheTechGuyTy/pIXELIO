// Custom Trivia System for BrainStorm Royale
const TRIVIA_CATEGORIES = {
  general: 'General Knowledge',
  science: 'Science',
  history: 'History',
  geography: 'Geography',
  math: 'Mathematics',
  popculture: 'Pop Culture',
  sports: 'Sports',
  technology: 'Technology',
  gaming: 'Gaming'
};

const TRIVIA_DIFFICULTY = {
  easy: { name: 'Easy', xpMultiplier: 1, coinMultiplier: 1 },
  medium: { name: 'Medium', xpMultiplier: 1.5, coinMultiplier: 1.5 },
  hard: { name: 'Hard', xpMultiplier: 2, coinMultiplier: 2 }
};

// Custom questions by category
const CUSTOM_TRIVIA = {
  // General Knowledge
  general: [
    {
      question: "What is the capital of France?",
      answers: ["Paris", "London", "Berlin", "Madrid"],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: "How many continents are there?",
      answers: ["5", "6", "7", "8"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "What is the largest ocean on Earth?",
      answers: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: "Who painted the Mona Lisa?",
      answers: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: "What is the smallest country in the world?",
      answers: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Science
  science: [
    {
      question: "What is the chemical symbol for gold?",
      answers: ["Go", "Au", "Gd", "Gl"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "How many planets are in our solar system?",
      answers: ["7", "8", "9", "10"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What gas do plants absorb from the atmosphere?",
      answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "What is the speed of light?",
      answers: ["299,792 km/s", "150,000 km/s", "450,000 km/s", "200,000 km/s"],
      correct: 0,
      difficulty: 'hard'
    },
    {
      question: "What is the powerhouse of the cell?",
      answers: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "What is the hardest natural substance on Earth?",
      answers: ["Steel", "Titanium", "Diamond", "Graphene"],
      correct: 2,
      difficulty: 'medium'
    }
  ],
  
  // History
  history: [
    {
      question: "When did World War II end?",
      answers: ["1943", "1944", "1945", "1946"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "Who was the first president of the United States?",
      answers: ["Jefferson", "Washington", "Adams", "Lincoln"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "In what year did the Titanic sink?",
      answers: ["1910", "1911", "1912", "1913"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "Who was the first person to walk on the moon?",
      answers: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What year did the Berlin Wall fall?",
      answers: ["1987", "1988", "1989", "1990"],
      correct: 2,
      difficulty: 'medium'
    }
  ],
  
  // Geography
  geography: [
    {
      question: "What is the capital of Japan?",
      answers: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "Which is the longest river in the world?",
      answers: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: "Mount Everest is located in which mountain range?",
      answers: ["Alps", "Andes", "Rockies", "Himalayas"],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: "What is the largest desert in the world?",
      answers: ["Sahara", "Arabian", "Antarctic", "Gobi"],
      correct: 2,
      difficulty: 'hard'
    },
    {
      question: "How many countries are in Africa?",
      answers: ["48", "52", "54", "58"],
      correct: 2,
      difficulty: 'hard'
    }
  ],
  
  // Mathematics
  math: [
    {
      question: "What is 15 × 8?",
      answers: ["110", "120", "130", "140"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What is the square root of 144?",
      answers: ["10", "11", "12", "13"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "What is the value of Pi to two decimal places?",
      answers: ["3.12", "3.14", "3.16", "3.18"],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: "What is 25% of 200?",
      answers: ["25", "50", "75", "100"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What is the next prime number after 7?",
      answers: ["9", "10", "11", "13"],
      correct: 2,
      difficulty: 'medium'
    }
  ],
  
  // Pop Culture
  popculture: [
    {
      question: "Who directed the movie 'Titanic'?",
      answers: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Martin Scorsese"],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: "What is the best-selling video game of all time?",
      answers: ["Tetris", "Minecraft", "GTA V", "Wii Sports"],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: "Who is known as the 'King of Pop'?",
      answers: ["Elvis Presley", "Michael Jackson", "Prince", "Freddie Mercury"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What social media platform has a bird as its logo?",
      answers: ["Facebook", "Instagram", "Twitter", "Snapchat"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "How many Harry Potter books are there?",
      answers: ["5", "6", "7", "8"],
      correct: 2,
      difficulty: 'easy'
    }
  ],
  
  // Sports
  sports: [
    {
      question: "How many players are on a soccer team?",
      answers: ["9", "10", "11", "12"],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: "What sport is played at Wimbledon?",
      answers: ["Golf", "Tennis", "Cricket", "Rugby"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "How many points is a touchdown in American football?",
      answers: ["5", "6", "7", "8"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "Which country won the FIFA World Cup in 2018?",
      answers: ["Brazil", "Germany", "France", "Argentina"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "What is the diameter of a basketball hoop in inches?",
      answers: ["16", "17", "18", "19"],
      correct: 2,
      difficulty: 'hard'
    }
  ],
  
  // Technology
  technology: [
    {
      question: "What does 'CPU' stand for?",
      answers: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Central Processor Union"],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: "Who founded Microsoft?",
      answers: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What year was the iPhone first released?",
      answers: ["2005", "2006", "2007", "2008"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "What does 'HTTP' stand for?",
      answers: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transport Process", "High Tech Transfer Protocol"],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: "What is the binary code for the number 10?",
      answers: ["1010", "1001", "1100", "1101"],
      correct: 0,
      difficulty: 'hard'
    }
  ],
  
  // Gaming
  gaming: [
    {
      question: "What company created Fortnite?",
      answers: ["Riot Games", "Epic Games", "Valve", "Blizzard"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "What is the main character's name in the Legend of Zelda?",
      answers: ["Zelda", "Link", "Ganon", "Sheik"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "In what year was Minecraft released?",
      answers: ["2009", "2010", "2011", "2012"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "What is the highest-grossing arcade game of all time?",
      answers: ["Pac-Man", "Space Invaders", "Street Fighter II", "Donkey Kong"],
      correct: 0,
      difficulty: 'hard'
    },
    {
      question: "What does 'RPG' stand for in gaming?",
      answers: ["Real Player Game", "Role Playing Game", "Random Play Generator", "Rocket Propelled Grenade"],
      correct: 1,
      difficulty: 'easy'
    }
  ]
};

// Get random question from category
function getRandomQuestion(category = 'general', difficulty = null) {
  const categoryQuestions = CUSTOM_TRIVIA[category] || CUSTOM_TRIVIA.general;
  
  let questions = categoryQuestions;
  if (difficulty) {
    questions = categoryQuestions.filter(q => q.difficulty === difficulty);
  }
  
  if (questions.length === 0) {
    questions = categoryQuestions;
  }
  
  return questions[Math.floor(Math.random() * questions.length)];
}

// Get mixed questions from multiple categories
function getMixedQuestions(count = 5, categories = ['general'], difficulty = null) {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const question = getRandomQuestion(category, difficulty);
    questions.push({
      ...question,
      category
    });
  }
  
  return questions;
}

// Calculate rewards based on difficulty
function calculateQuestionReward(difficulty) {
  const diffData = TRIVIA_DIFFICULTY[difficulty] || TRIVIA_DIFFICULTY.easy;
  return {
    xp: Math.floor(10 * diffData.xpMultiplier),
    coins: Math.floor(5 * diffData.coinMultiplier)
  };
}

module.exports = {
  TRIVIA_CATEGORIES,
  TRIVIA_DIFFICULTY,
  CUSTOM_TRIVIA,
  getRandomQuestion,
  getMixedQuestions,
  calculateQuestionReward
};
