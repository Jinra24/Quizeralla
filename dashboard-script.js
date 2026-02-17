// User Dashboard Script - Firebase Backend

let auth, database;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentQuiz = null;
let quizAnswers = {};

// Initialize Firebase and check access
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to initialize
  let maxWait = 50;
  while ((!window.firebaseServices || !window.firebaseServices.auth) && maxWait > 0) {
    await new Promise(r => setTimeout(r, 100));
    maxWait--;
  }

  if (!window.firebaseServices) {
    console.error('Firebase not initialized');
    window.location.href = 'index.html';
    return;
  }

  auth = window.firebaseServices.auth;
  database = window.firebaseServices.database;

  // Check if user is logged in
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // Set up auth state listener only to detect logouts
  auth.onAuthStateChanged(user => {
    if (!user) {
      // User was logged out
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    }
  });

  initializeDashboard();
  setupQuizListener();
});

function initializeDashboard() {
  const name = currentUser.name.split(' ')[0];
  document.getElementById('welcomeName').textContent = name;
  document.getElementById('userDisplay').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
}

function setupQuizListener() {
  const fileInput = document.getElementById('quizFile');
  fileInput.addEventListener('change', handleFileSelect);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  const fileStatus = document.getElementById('fileStatus');
  
  if (!file) {
    fileStatus.textContent = '';
    document.getElementById('questionOptions').style.display = 'none';
    return;
  }

  fileStatus.textContent = `✓ File selected: ${file.name}`;
  fileStatus.style.color = '#5DA87A';
  document.getElementById('questionOptions').style.display = 'block';
}

async function generateQuiz() {
  const fileInput = document.getElementById('quizFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file first');
    return;
  }

  const text = await extractTextFromFile(file);
  if (!text || text.trim().length < 10) {
    alert('File appears to be empty. Please use a valid file.');
    return;
  }

  let numQuestions = parseInt(document.getElementById('numQuestions').value);
  const questions = generateQuestions(text, numQuestions);

  if (questions.length === 0) {
    alert('Could not generate questions from this file. Please try another file with more content.');
    return;
  }

  // Adjust numQuestions if fewer questions were generated
  numQuestions = Math.min(numQuestions, questions.length);

  currentQuiz = questions.slice(0, numQuestions);
  quizAnswers = {};
  renderQuiz();
}

async function extractTextFromFile(file) {
  try {
    // Handle PDF files
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }
    
    // Handle TXT and other text formats
    const text = await file.text();
    return text;
  } catch (err) {
    console.error('Error reading file:', err);
    return '';
  }
}

async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Check if PDF.js is available
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF library not loaded');
    }

    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (err) {
    console.error('PDF extraction error:', err);
    // Fallback to basic text reading
    try {
      return await file.text();
    } catch {
      return '';
    }
  }
}

function generateQuestions(text, numQuestions) {
  // Split by sentences and also try splitting by periods, newlines, or semicolons
  let sentences = text.match(/[^.!?;:\n]+[.!?;:\n]+/g) || [];
  
  // If no sentences found, try splitting by common delimiters
  if (sentences.length === 0) {
    sentences = text.split(/[\n;:,]/).filter(s => s.trim().length > 0);
  }

  // Clean sentences
  const cleanSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 15); // Lowered from 30

  if (cleanSentences.length === 0) {
    // If still no valid sentences, create one from the entire text
    if (text.trim().length > 20) {
      cleanSentences.push(text.trim());
    } else {
      return [];
    }
  }

  // Limit questions to available sentences
  const maxQuestions = Math.min(numQuestions, cleanSentences.length * 2);

  const questions = [];
  const selectedIndices = new Set();
  const allWords = text.match(/\b\w{3,}\b/g) || [];
  const uniqueWords = [...new Set(allWords.map(w => w.toLowerCase()))];

  for (let i = 0; i < maxQuestions && questions.length < maxQuestions; i++) {
    let idx;
    let attempts = 0;
    
    do {
      idx = Math.floor(Math.random() * cleanSentences.length);
      attempts++;
    } while (selectedIndices.has(idx) && selectedIndices.size < cleanSentences.length && attempts < 10);
    
    selectedIndices.add(idx);
    let sentence = cleanSentences[idx];

    // Extract key terms (words with 3+ characters, lowered from 4)
    const words = sentence.match(/\b\w{3,}\b/g) || [];
    if (words.length < 1) continue;

    // Random key word to blank out
    const answerWord = words[Math.floor(Math.random() * words.length)];
    
    // Determine question type: Definition (55%), Identification (40%), Fill-in-blank (5%)
    const questionType = Math.random();
    let question = null;

    if (questionType < 0.05) {
      // Fill-in-the-blank question (5%)
      const questionText = sentence.replace(new RegExp(`\\b${answerWord}\\b`, 'i'), '___________');
      
      const distractors = generateDistractors(answerWord, uniqueWords);
      const choices = [answerWord, ...distractors.slice(0, 3)];
      
      // Shuffle choices
      for (let j = choices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [choices[j], choices[k]] = [choices[k], choices[j]];
      }

      question = {
        id: questions.length,
        type: 'fill-blank',
        question: `Complete: ${questionText}`,
        answer: answerWord,
        choices: choices
      };
    } else if (questionType < 0.6) {
      // Definition question (55%)
      const simpleWord = answerWord.replace(/[^a-zA-Z0-9]/g, '');
      if (simpleWord.length > 3) {
        const definitionContext = sentence.substring(0, 120) + '...';
        
        const distractors = generateDistractors(answerWord, uniqueWords);
        const choices = [answerWord, ...distractors.slice(0, 3)];
        
        // Shuffle choices
        for (let j = choices.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [choices[j], choices[k]] = [choices[k], choices[j]];
        }

        question = {
          id: questions.length,
          type: 'definition',
          question: `Based on the context: "${definitionContext}", what is the most important concept or term?`,
          answer: answerWord,
          choices: choices
        };
      }
    } else {
      // Identification question (40%)
      const questionText = sentence.substring(0, Math.min(100, sentence.length));
      
      const distractors = generateDistractors(answerWord, uniqueWords);
      const choices = [answerWord, ...distractors.slice(0, 3)];
      
      // Shuffle choices
      for (let j = choices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [choices[j], choices[k]] = [choices[k], choices[j]];
      }

      question = {
        id: questions.length,
        type: 'identification',
        question: `Identify the key concept or term being described: "${questionText}..."`,
        answer: answerWord,
        choices: choices
      };
    }

    if (question) {
      questions.push(question);
    }
  }

  return questions.slice(0, Math.max(Math.min(numQuestions, cleanSentences.length * 2)));
}

function generateDistractors(answerWord, allWords) {
  const distractors = [];
  const maxAttempts = Math.min(allWords.length, 100);
  
  for (let j = 0; j < maxAttempts && distractors.length < 3; j++) {
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    if (randomWord.toLowerCase() !== answerWord.toLowerCase() && randomWord.length > 2 && !distractors.includes(randomWord)) {
      distractors.push(randomWord);
    }
  }

  // If not enough distractors, create variations
  while (distractors.length < 3) {
    const fakeWord = answerWord.substring(0, Math.max(1, answerWord.length - 1)) + 'x';
    if (fakeWord.toLowerCase() !== answerWord.toLowerCase() && !distractors.includes(fakeWord)) {
      distractors.push(fakeWord);
    } else {
      const fakeWord2 = answerWord + 'ed';
      if (fakeWord2.toLowerCase() !== answerWord.toLowerCase() && !distractors.includes(fakeWord2)) {
        distractors.push(fakeWord2);
      } else {
        distractors.push('unknown_' + Math.floor(Math.random() * 1000));
      }
    }
  }

  return distractors;
}

function renderQuiz() {
  const quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = '';

  currentQuiz.forEach((q, idx) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'quiz-question';
    questionDiv.style.marginBottom = '30px';
    questionDiv.style.padding = '20px';
    questionDiv.style.background = 'rgba(255, 255, 255, 0.05)';
    questionDiv.style.borderRadius = '8px';

    // Question type badge
    const typeBadge = document.createElement('span');
    typeBadge.style.display = 'inline-block';
    typeBadge.style.fontSize = '12px';
    typeBadge.style.padding = '4px 8px';
    typeBadge.style.background = '#5DA87A';
    typeBadge.style.color = 'white';
    typeBadge.style.borderRadius = '4px';
    typeBadge.style.marginBottom = '8px';
    
    const typeText = q.type === 'fill-blank' ? 'Fill-in-the-Blank' : 
                     q.type === 'definition' ? 'Definition' : 'Identification';
    typeBadge.textContent = typeText;

    const questionText = document.createElement('div');
    questionText.style.marginBottom = '15px';
    questionText.style.fontSize = '16px';
    questionText.style.fontWeight = '600';
    questionText.textContent = `Q${idx + 1}: ${q.question}`;

    questionDiv.appendChild(typeBadge);
    questionDiv.appendChild(questionText);

    const choicesDiv = document.createElement('div');
    choicesDiv.style.display = 'grid';
    choicesDiv.style.gridTemplateColumns = 'repeat(2, 1fr)';
    choicesDiv.style.gap = '12px';

    q.choices.forEach((choice, choiceIdx) => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.padding = '10px';
      label.style.background = 'rgba(255, 255, 255, 0.05)';
      label.style.borderRadius = '6px';
      label.style.cursor = 'pointer';
      label.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      label.style.transition = 'all 0.3s';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${idx}`;
      input.value = choice;
      input.style.marginRight = '10px';
      input.onchange = () => {
        quizAnswers[idx] = choice;
        // Visual feedback
        Array.from(choicesDiv.children).forEach(child => {
          child.style.background = 'rgba(255, 255, 255, 0.05)';
          child.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        label.style.background = 'rgba(93, 168, 122, 0.2)';
        label.style.borderColor = '#5DA87A';
      };

      const choiceLabel = document.createElement('span');
      const choiceLetters = ['A', 'B', 'C', 'D'];
      choiceLabel.textContent = `${choiceLetters[choiceIdx]}) ${choice}`;

      label.appendChild(input);
      label.appendChild(choiceLabel);
      choicesDiv.appendChild(label);
    });

    questionDiv.appendChild(choicesDiv);
    quizContainer.appendChild(questionDiv);
  });

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit Quiz';
  submitBtn.className = 'btn-generate';
  submitBtn.style.marginTop = '20px';
  submitBtn.onclick = submitQuiz;
  quizContainer.appendChild(submitBtn);

  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('quizResult').style.display = 'none';
}

function submitQuiz() {
  let correct = 0;
  const results = [];

  currentQuiz.forEach((q, idx) => {
    const userAnswer = quizAnswers[idx] || 'Not answered';
    const isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
    
    if (isCorrect) {
      correct++;
    }

    results.push({
      questionNumber: idx + 1,
      question: q.question,
      questionType: q.type,
      userAnswer: userAnswer,
      correctAnswer: q.answer,
      isCorrect: isCorrect,
      choices: q.choices
    });
  });

  const percentage = Math.round((correct / currentQuiz.length) * 100);
  displayQuizResults(results, correct, percentage);
}

function displayQuizResults(results, correct, percentage) {
  const quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = '';

  // Score summary
  const summaryDiv = document.createElement('div');
  summaryDiv.style.background = 'rgba(93, 168, 122, 0.1)';
  summaryDiv.style.border = '2px solid #5DA87A';
  summaryDiv.style.borderRadius = '8px';
  summaryDiv.style.padding = '20px';
  summaryDiv.style.marginBottom = '30px';
  summaryDiv.style.textAlign = 'center';

  const scoreTitle = document.createElement('h3');
  scoreTitle.style.color = '#5DA87A';
  scoreTitle.style.marginBottom = '10px';
  scoreTitle.textContent = 'Quiz Complete!';

  const scoreText = document.createElement('p');
  scoreText.style.fontSize = '28px';
  scoreText.style.fontWeight = 'bold';
  scoreText.style.color = percentage >= 70 ? '#5DA87A' : '#B67E7D';
  scoreText.style.margin = '10px 0';
  scoreText.textContent = `${correct}/${results.length} Correct`;

  const percentText = document.createElement('p');
  percentText.style.fontSize = '20px';
  percentText.style.color = 'rgba(255, 255, 255, 0.8)';
  percentText.textContent = `Score: ${percentage}%`;

  summaryDiv.appendChild(scoreTitle);
  summaryDiv.appendChild(scoreText);
  summaryDiv.appendChild(percentText);
  quizContainer.appendChild(summaryDiv);

  // Detailed results
  const detailsTitle = document.createElement('h3');
  detailsTitle.style.color = 'white';
  detailsTitle.style.marginBottom = '20px';
  detailsTitle.textContent = 'Review Your Answers:';
  quizContainer.appendChild(detailsTitle);

  results.forEach((result) => {
    const resultDiv = document.createElement('div');
    resultDiv.style.marginBottom = '20px';
    resultDiv.style.padding = '15px';
    resultDiv.style.background = result.isCorrect ? 'rgba(93, 168, 122, 0.1)' : 'rgba(220, 38, 38, 0.1)';
    resultDiv.style.border = `2px solid ${result.isCorrect ? '#5DA87A' : '#ef4444'}`;
    resultDiv.style.borderRadius = '8px';

    // Question number and type
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.gap = '10px';
    headerDiv.style.marginBottom = '10px';

    const statusIcon = document.createElement('span');
    statusIcon.style.fontSize = '20px';
    statusIcon.textContent = result.isCorrect ? '✅' : '❌';

    const questionNum = document.createElement('span');
    questionNum.style.fontWeight = 'bold';
    questionNum.style.color = result.isCorrect ? '#5DA87A' : '#ef4444';
    questionNum.textContent = `Q${result.questionNumber}`;

    const typeTag = document.createElement('span');
    typeTag.style.fontSize = '12px';
    typeTag.style.padding = '3px 8px';
    typeTag.style.background = 'rgba(255, 255, 255, 0.2)';
    typeTag.style.borderRadius = '3px';
    typeTag.style.color = 'rgba(255, 255, 255, 0.7)';
      const typeText = result.questionType === 'fill-blank' ? 'Fill-blank' : 
                       result.questionType === 'definition' ? 'Definition' : 'Identification';
    typeTag.textContent = typeText;

    headerDiv.appendChild(statusIcon);
    headerDiv.appendChild(questionNum);
    headerDiv.appendChild(typeTag);
    resultDiv.appendChild(headerDiv);

    // Question text
    const questionDiv = document.createElement('div');
    questionDiv.style.marginBottom = '12px';
    questionDiv.style.color = 'rgba(255, 255, 255, 0.9)';
    questionDiv.style.fontSize = '14px';
    questionDiv.textContent = `Question: ${result.question}`;
    resultDiv.appendChild(questionDiv);

    // User's answer
    const userAnswerDiv = document.createElement('div');
    userAnswerDiv.style.marginBottom = '8px';
    userAnswerDiv.style.padding = '8px';
    userAnswerDiv.style.background = result.isCorrect ? 'rgba(93, 168, 122, 0.2)' : 'rgba(220, 38, 38, 0.2)';
    userAnswerDiv.style.borderRadius = '4px';
    userAnswerDiv.style.fontSize = '14px';

    const userAnswerLabel = document.createElement('span');
    userAnswerLabel.style.color = result.isCorrect ? '#5DA87A' : '#ef4444';
    userAnswerLabel.style.fontWeight = '600';
    userAnswerLabel.textContent = result.isCorrect ? 'Your Answer: ' : 'Your Answer: ';

    const userAnswerText = document.createElement('span');
    userAnswerText.style.color = 'white';
    userAnswerText.textContent = result.userAnswer;

    userAnswerDiv.appendChild(userAnswerLabel);
    userAnswerDiv.appendChild(userAnswerText);
    resultDiv.appendChild(userAnswerDiv);

    // Correct answer (show if wrong)
    if (!result.isCorrect) {
      const correctAnswerDiv = document.createElement('div');
      correctAnswerDiv.style.padding = '8px';
      correctAnswerDiv.style.background = 'rgba(93, 168, 122, 0.2)';
      correctAnswerDiv.style.borderRadius = '4px';
      correctAnswerDiv.style.fontSize = '14px';

      const correctLabel = document.createElement('span');
      correctLabel.style.color = '#5DA87A';
      correctLabel.style.fontWeight = '600';
      correctLabel.textContent = 'Correct Answer: ';

      const correctText = document.createElement('span');
      correctText.style.color = 'white';
      correctText.textContent = result.correctAnswer;

      correctAnswerDiv.appendChild(correctLabel);
      correctAnswerDiv.appendChild(correctText);
      resultDiv.appendChild(correctAnswerDiv);
    }

    quizContainer.appendChild(resultDiv);
  });

  // Action buttons
  const buttonDiv = document.createElement('div');
  buttonDiv.style.display = 'flex';
  buttonDiv.style.gap = '10px';
  buttonDiv.style.justifyContent = 'center';
  buttonDiv.style.marginTop = '30px';

  const retryBtn = document.createElement('button');
  retryBtn.className = 'btn-generate';
  retryBtn.style.background = 'linear-gradient(135deg, #B67E7D 0%, #a86d6c 100%)';
  retryBtn.textContent = 'Retry Same Quiz';
  retryBtn.onclick = retakeQuiz;

  const newBtn = document.createElement('button');
  newBtn.className = 'btn-generate';
  newBtn.textContent = 'Try Another Quiz';
  newBtn.onclick = resetQuiz;

  buttonDiv.appendChild(retryBtn);
  buttonDiv.appendChild(newBtn);
  quizContainer.appendChild(buttonDiv);

  document.getElementById('quizContainer').style.display = 'block';
}

function resetQuiz() {
  document.getElementById('quizFile').value = '';
  document.getElementById('fileStatus').textContent = '';
  document.getElementById('questionOptions').style.display = 'none';
  document.getElementById('quizContainer').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  currentQuiz = null;
  quizAnswers = {};
}

function retakeQuiz() {
  // Reset answers
  quizAnswers = {};
  
  // Shuffle questions
  shuffleArray(currentQuiz);
  
  // Shuffle answer choices for each question
  currentQuiz.forEach(q => {
    shuffleArray(q.choices);
  });
  
  renderQuiz();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function logout() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    })
    .catch(err => {
      console.error('Logout error:', err);
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
}
