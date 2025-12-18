const quiz = [
  {
    question: "What city was Wolfgang Amadeus Mozart born in?",
    choices: ["Munich", "Prague", "Vienna", "Salzburg"],
    correct: 3
  },
  {
    question: "Which composer is called the “Father of Western Classical Music”?",
    choices: ["Haydn", "Beethoven", "Bach", "Mozart"],
    correct: 2
  },
  {
    question: "Which figure defined medieval music by standardizing the Gregorian Chant?",
    choices: ["Hildegard of Bingen", "Charlemagne the Great", "Thomas Aquinas", "Gregory I"],
    correct: 3
  },
  {
    question: "Through the earliest operas, who transitioned music from Renaissance to Baroque?",
    choices: ["Monteverdi", "Palestrina", "Lully", "Byrd"],
    correct: 0
  },
  {
    question: "Despite becoming deaf, this musician bridged Classical and Romantic periods.",
    choices: ["Haydn", "Beethoven", "Bach", "Mozart"],
    correct: 1
  }
];

let currentIndex = 0;
let score = 0;

const questionElement = document.getElementById("question");
const choicesElement = document.getElementById("choices");
const scoreElement = document.getElementById("score");

function loadQuestion() {
  if (currentIndex >= quiz.length) {
    questionElement.textContent = "Quiz Complete!";
    choicesElement.innerHTML = "";
    scoreElement.textContent = `Final Score: ${score}/${quiz.length}`;
    return;
  }

  const q = quiz[currentIndex];
  questionElement.textContent = q.question;
  choicesElement.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(index);
    choicesElement.appendChild(btn);
  });
}

function checkAnswer(selected) {
  if (selected === quiz[currentIndex].correct) {
    score++;
  }
  currentIndex++;
  scoreElement.textContent = `Score: ${score}`;
  loadQuestion();
}

window.onload = () => {
  loadQuestion();
};

