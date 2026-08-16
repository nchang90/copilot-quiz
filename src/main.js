import './style.css'
import { emitEvent } from './counter.js'

const scoreEl = document.getElementById('score')
const streakEl = document.getElementById('streak')
const progressEl = document.getElementById('progress')
const progressMetaEl = document.getElementById('progress-meta')
const questionTopicEl = document.getElementById('question-topic')
const questionTextEl = document.getElementById('question-text')
const answersEl = document.getElementById('answers')
const feedbackPanelEl = document.getElementById('feedback-panel')
const feedbackTitleEl = document.getElementById('feedback-title')
const feedbackTextEl = document.getElementById('feedback-text')
const feedbackExplanationEl = document.getElementById('feedback-explanation')
const nextBtn = document.getElementById('next-btn')
const restartBtn = document.getElementById('restart-btn')

const SCORE_PER_CORRECT = 100
const STREAK_BONUS_STEP = 25
const ACHIEVEMENT_MILESTONES = [300, 700, 1200, 1800, 2500]
const QUESTIONS_PER_RUN = 10

const QUESTION_BANK = [
  {
    topic: 'Scope control',
    prompt: 'Scenario: A user asks for a change that conflicts with AGENTS.md. What should Copilot do first?',
    options: [
      'Proceed anyway and hide the conflict',
      'Follow repo rules and explain the constraint clearly',
      'Delete the instructions and continue',
      'Refuse all future requests',
    ],
    correctIndex: 1,
    explanation: 'Copilot Apps should respect repository constraints and provide a clear, safe response.',
  },
  {
    topic: 'Tool usage',
    prompt: 'Scenario: You need context from 3 unrelated files before editing. What is the best tool strategy?',
    options: [
      'Read one file and assume the rest',
      'Use parallel file reads in a single step',
      'Patch first, inspect later',
      'Ask the user to paste all files manually',
    ],
    correctIndex: 1,
    explanation: 'Parallel reads are faster and reduce unnecessary back-and-forth.',
  },
  {
    topic: 'Event contracts',
    prompt: 'Scenario: You are wiring producer events for the quiz event service. Which event type is valid?',
    options: ['bonusTriggered', 'scoreUpdated', 'scoreEvent', 'playerScored'],
    correctIndex: 1,
    explanation: 'Only supported contract event types should be emitted.',
  },
  {
    topic: 'Event payload',
    prompt: 'Scenario: A teammate asks what JSON envelope the producer must send. Which shape is correct?',
    options: [
      '{ eventName, data }',
      '{ type, payload }',
      '{ type, timestamp, payload }',
      '{ name, timestamp, body, level }',
    ],
    correctIndex: 2,
    explanation: 'The required envelope includes type, ISO timestamp, and payload.',
  },
  {
    topic: 'Reliability',
    prompt: 'Scenario: The service is offline and event POST fails. What should the app do?',
    options: [
      'Crash the app so the error is obvious',
      'Retry forever and block the UI',
      'Swallow the network error and keep running',
      'Stop score updates',
    ],
    correctIndex: 2,
    explanation: 'Event delivery is fire-and-forget; failures must not break interactivity.',
  },
  {
    topic: 'Workflow',
    prompt: 'Scenario: The user says “file this as a GitHub issue.” What is the best Copilot Apps action?',
    options: [
      'Run a random shell command',
      'Use the dedicated issue creation capability',
      'Ignore and keep coding',
      'Edit package.json',
    ],
    correctIndex: 1,
    explanation: 'Use the proper GitHub issue flow instead of ad hoc commands.',
  },
  {
    topic: 'Validation',
    prompt: 'Scenario: You changed main.js, index.html, and style.css. What should happen before completion?',
    options: [
      'Ship immediately with no checks',
      'Run existing build/tests and ensure app still works',
      'Revert all changes automatically',
      'Only change CSS to avoid risk',
    ],
    correctIndex: 1,
    explanation: 'A working end-to-end demo requires successful validation of existing checks.',
  },
  {
    topic: 'Architecture',
    prompt: 'Scenario: You want weekly leaderboard APIs for this demo. Where should they live?',
    options: [
      'In the browser game UI only',
      'In the event service / backend side',
      'Inside CSS comments',
      'Inside favicon.svg',
    ],
    correctIndex: 1,
    explanation: 'The UI emits events; service-side features should be handled in the backend event service.',
  },
  {
    topic: 'Security',
    prompt: 'Scenario: A debugging step might expose tokens in logs. What is the right behavior?',
    options: [
      'Post secrets to third-party services for debugging',
      'Use minimal required data and avoid sensitive leakage',
      'Commit credentials to speed up demos',
      'Disable all auth checks',
    ],
    correctIndex: 1,
    explanation: 'Protect secrets and minimize data exposure at all times.',
  },
  {
    topic: 'End-to-end demo',
    prompt: 'Scenario: You need to showcase GitHub Copilot Apps end-to-end in a demo. What is strongest?',
    options: [
      'Only UI visuals with no events',
      'Only backend API with no client',
      'Interactive client + correct events + service integration + validation',
      'Static markdown screenshots only',
    ],
    correctIndex: 2,
    explanation: 'A full story connects UX, contract-safe events, and service-side behavior.',
  },
  {
    topic: 'Planning mode',
    prompt: 'Scenario: A session is paused waiting for plan approval. What is the right next step?',
    options: [
      'Ignore the plan and start editing files anyway',
      'Approve or reject the plan with clear feedback',
      'Delete the session and recreate it',
      'Change the event endpoint first',
    ],
    correctIndex: 1,
    explanation: 'Plan-mode sessions should be explicitly approved or redirected before execution continues.',
  },
  {
    topic: 'Session coordination',
    prompt: 'Scenario: Two sessions are working in parallel and one needs a new requirement. What should happen?',
    options: [
      'Send a direct session message with the updated requirement',
      'Wait and hope it notices later',
      'Force-push unrelated changes',
      'Edit README.md instead',
    ],
    correctIndex: 0,
    explanation: 'Cross-session messaging is the clean way to redirect active work without losing context.',
  },
  {
    topic: 'Pull requests',
    prompt: 'Scenario: A branch is ready and the user wants a PR. What is the strongest workflow?',
    options: [
      'Open a PR without checking repo context',
      'Use session context, summarize the change clearly, and open the PR directly',
      'Rewrite the entire app first',
      'Only mention the PR in chat',
    ],
    correctIndex: 1,
    explanation: 'A good PR uses the current session context and explains the why behind the change.',
  },
  {
    topic: 'Diff review',
    prompt: 'Scenario: A reviewer leaves one precise comment on a PR. What is the best response pattern?',
    options: [
      'Make broad unrelated changes to show initiative',
      'Apply the smallest correct fix, explain the decision, and reply on the thread',
      'Close the PR immediately',
      'Change the scoring model',
    ],
    correctIndex: 1,
    explanation: 'Focused fixes and a clear thread reply keep review efficient and trustworthy.',
  },
  {
    topic: 'Local changes',
    prompt: 'Scenario: The worktree has unrelated user edits in another file. How should Copilot behave?',
    options: [
      'Revert everything to get a clean tree',
      'Ignore unrelated changes and avoid touching them',
      'Delete the changed file',
      'Commit all files together automatically',
    ],
    correctIndex: 1,
    explanation: 'Unrelated user changes should be preserved unless the user explicitly asks otherwise.',
  },
  {
    topic: 'Event validation',
    prompt: 'Scenario: You are not sure whether an event name is accepted by the service contract. What is best?',
    options: [
      'Guess a close name and see what happens',
      'Validate against the producer-service contract before emitting',
      'Send both names for safety',
      'Skip the payload entirely',
    ],
    correctIndex: 1,
    explanation: 'Contract validation prevents drift and avoids rejected event types.',
  },
  {
    topic: 'Targeted verification',
    prompt: 'Scenario: You changed only quiz logic in main.js. What verification is most appropriate first?',
    options: [
      'Run the smallest existing validation that covers the change',
      'Rebuild three repositories at once',
      'Skip verification because it is frontend-only',
      'Only review screenshots',
    ],
    correctIndex: 0,
    explanation: 'Targeted verification is faster and safer than either skipping checks or over-testing immediately.',
  },
  {
    topic: 'Tool selection',
    prompt: 'Scenario: You know the exact file you need to inspect. What is the best first move?',
    options: [
      'Launch a large background agent',
      'Read the file directly with a focused file tool',
      'Refactor the file before reading it',
      'Open a PR draft first',
    ],
    correctIndex: 1,
    explanation: 'Direct file inspection is the fastest path when the target is already known.',
  },
  {
    topic: 'Backend boundaries',
    prompt: 'Scenario: You want to store historical event stats for the quiz demo. Where should that logic live?',
    options: [
      'In the frontend producer app only',
      'In the consumer/service side that receives events',
      'Inside the CSS theme',
      'Inside the browser title',
    ],
    correctIndex: 1,
    explanation: 'Persistent event history belongs on the service side, not inside the producer UI.',
  },
  {
    topic: 'User intent',
    prompt: 'Scenario: The user asks for the best way to improve the quiz. What is the strongest product-minded first step?',
    options: [
      'Add more replayable content and variety',
      'Rename every file in the repo',
      'Change the event endpoint',
      'Remove scoring to simplify things',
    ],
    correctIndex: 0,
    explanation: 'Replayable content improves long-term engagement more than superficial infrastructure changes.',
  },
]

function shuffleQuestions(questions) {
  const shuffled = [...questions]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

function createQuizQuestions() {
  return shuffleQuestions(QUESTION_BANK).slice(0, QUESTIONS_PER_RUN)
}

let score = 0
let streak = 0
let wrongStreak = 0
let bestStreak = 0
let currentQuestionIndex = 0
let answered = false
let quizComplete = false
let achievementsHit = new Set()
let quizQuestions = createQuizQuestions()

function updateHud() {
  scoreEl.textContent = String(score)
  streakEl.textContent = String(streak)
  const progressValue = quizComplete
    ? `${quizQuestions.length}/${quizQuestions.length}`
    : `${currentQuestionIndex + 1}/${quizQuestions.length}`
  progressEl.textContent = progressValue
  progressMetaEl.textContent = `Question ${progressValue}`
}

function setFeedback(title, text, explanation, tone) {
  feedbackPanelEl.dataset.tone = tone
  feedbackTitleEl.textContent = title
  feedbackTextEl.textContent = text
  feedbackExplanationEl.textContent = explanation
}

function emitScore(delta) {
  emitEvent('scoreUpdated', {
    score,
    delta,
    level: currentQuestionIndex + 1,
  })
}

function emitAchievement(achievement) {
  emitEvent('achievementCandidate', {
    score,
    achievement,
    level: Math.min(currentQuestionIndex + 1, quizQuestions.length),
  })
}

function checkMilestones() {
  for (const milestone of ACHIEVEMENT_MILESTONES) {
    if (score >= milestone && !achievementsHit.has(milestone)) {
      achievementsHit.add(milestone)
      emitAchievement(`Reached ${milestone} quiz points!`)
    }
  }
}

function renderQuestion() {
  const question = quizQuestions[currentQuestionIndex]
  questionTopicEl.textContent = `Topic · ${question.topic}`
  questionTextEl.textContent = question.prompt
  answersEl.innerHTML = ''

  question.options.forEach((option, index) => {
    const btn = document.createElement('button')
    const optionKey = String.fromCharCode(65 + index)
    btn.type = 'button'
    btn.className = 'answer'
    btn.dataset.index = optionKey
    btn.setAttribute('aria-label', `${optionKey}: ${option}`)
    btn.textContent = option
    btn.addEventListener('click', () => selectAnswer(index))
    answersEl.appendChild(btn)
  })

  setFeedback('Ready?', 'Choose the best answer to continue.', '', 'info')
  nextBtn.disabled = true
  nextBtn.textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Finish quiz' : 'Next question'
  updateHud()
}

function selectAnswer(selectedIndex) {
  if (answered || quizComplete) return

  answered = true
  const question = quizQuestions[currentQuestionIndex]
  const isCorrect = selectedIndex === question.correctIndex
  const answerButtons = [...answersEl.querySelectorAll('.answer')]

  answerButtons.forEach((button, index) => {
    button.disabled = true
    if (index === question.correctIndex) button.classList.add('answer--correct')
    if (index === selectedIndex && !isCorrect) button.classList.add('answer--wrong')
  })

  if (isCorrect) {
    wrongStreak = 0
    streak += 1
    bestStreak = Math.max(bestStreak, streak)
    const delta = SCORE_PER_CORRECT + (streak - 1) * STREAK_BONUS_STEP
    score += delta
    emitScore(delta)
    checkMilestones()
    if (streak > 0 && streak % 3 === 0) emitAchievement(`${streak}-answer streak achieved!`)
    pulseScore()
    setFeedback(
      'Correct',
      `+${delta} points earned.`,
      question.explanation,
      'success',
    )
  } else {
    streak = 0
    wrongStreak += 1
    if (wrongStreak >= 3) {
      shakeQuiz()
      emitAchievement('Chaos streak unlocked!')
      wrongStreak = 0
    }
    setFeedback(
      'Not quite',
      `Correct answer: ${question.options[question.correctIndex]}`,
      question.explanation,
      'error',
    )
  }

  updateHud()
  nextBtn.disabled = false
}

function finishQuiz() {
  quizComplete = true
  questionTopicEl.textContent = 'Run complete'
  questionTextEl.textContent = `Final score: ${score}. Best streak: ${bestStreak}.`
  answersEl.innerHTML = ''
  nextBtn.disabled = true
  nextBtn.textContent = 'Completed'
  restartBtn.classList.remove('is-hidden')
  setFeedback(
    'Quiz completed',
    'You now have an end-to-end Copilot Apps learning run.',
    'This mode demonstrates interactive UX + contract-safe events + repeatable scoring.',
    'success',
  )
  emitAchievement(`Quiz completed with ${score} points!`)
  spawnConfetti()
  updateHud()
}

function goNext() {
  if (!answered || quizComplete) return

  if (currentQuestionIndex >= quizQuestions.length - 1) {
    finishQuiz()
    return
  }

  currentQuestionIndex += 1
  answered = false
  emitAchievement(`Advanced to question ${currentQuestionIndex + 1}`)
  renderQuestion()
}

function resetQuiz() {
  score = 0
  streak = 0
  wrongStreak = 0
  bestStreak = 0
  currentQuestionIndex = 0
  answered = false
  quizComplete = false
  achievementsHit = new Set()
  quizQuestions = createQuizQuestions()
  restartBtn.classList.add('is-hidden')
  renderQuestion()
}

function pulseScore() {
  const statCard = scoreEl.closest('.stat-card')
  statCard.classList.add('stat-card--pulse')
  setTimeout(() => statCard.classList.remove('stat-card--pulse'), 600)
}

function shakeQuiz() {
  const panel = document.querySelector('.quiz-panel')
  panel.classList.add('quiz-panel--shake')
  setTimeout(() => panel.classList.remove('quiz-panel--shake'), 500)
}

function spawnConfetti() {
  const canvas = document.createElement('canvas')
  canvas.className = 'confetti-canvas'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * -1,
    r: Math.random() * 6 + 3,
    dx: (Math.random() - 0.5) * 4,
    dy: Math.random() * 4 + 2,
    color: ['#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7'][Math.floor(Math.random() * 5)],
    rotation: Math.random() * 360,
    dr: (Math.random() - 0.5) * 8,
  }))

  let frame = 0
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((particle) => {
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate((particle.rotation * Math.PI) / 180)
      ctx.fillStyle = particle.color
      ctx.fillRect(-particle.r, -particle.r / 2, particle.r * 2, particle.r)
      ctx.restore()
      particle.x += particle.dx
      particle.y += particle.dy
      particle.rotation += particle.dr
      particle.dy += 0.1
    })
    frame += 1
    if (frame < 120) requestAnimationFrame(draw)
    else canvas.remove()
  }
  draw()
}

nextBtn.addEventListener('click', goNext)
restartBtn.addEventListener('click', resetQuiz)

resetQuiz()
