document.addEventListener('DOMContentLoaded', function () {
    let quizData = null;
    fetch('quiz-data.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
            initSections();
        })
        .catch(error => console.error('Error loading quiz data:', error));

    function initSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.addEventListener('click', function () {
                const currentSection = this.getAttribute('data-section');
                startQuiz(currentSection);
            });
        });
    }

    function startQuiz(sectionIndex) {
        const currentQuestions = quizData.sections[sectionIndex].questions;
        let currentQuestionIndex = 0;
        let score = 0;
        let answerSelected = false;

        const quizContainer = document.getElementById('quiz-container');
        const questionContainer = document.getElementById('question-container');
        resetQuizContainer();

        function resetQuizContainer() {
            questionContainer.innerHTML = `
                <div id="score">Score: 0</div>
                <div id="question"></div>
                <div id="options"></div>
                <button id="next-button">Next</button>
            `;
            updateEventListeners();
        }

        function updateEventListeners() {
            const nextButton = document.getElementById('next-button');
            nextButton.addEventListener('click', function () {
                if (answerSelected) {
                    if (currentQuestionIndex < currentQuestions.length - 1) {
                        currentQuestionIndex++;
                        showQuestion();
                    } else {
                        endQuiz();
                    }
                    answerSelected = false;
                }
            });
        }

        function showQuestion() {
            const question = currentQuestions[currentQuestionIndex];
            const questionElement = document.getElementById('question');
            const optionsElement = document.getElementById('options');

            questionElement.textContent = question.question;
            optionsElement.innerHTML = '';
            if (question.questionType === 'mcq') {
                question.options.forEach(option => {
                    const optionElement = document.createElement('div');
                    optionElement.textContent = option;
                    optionElement.addEventListener('click', function () {
                        if (!answerSelected) {
                            answerSelected = true;
                            highlightSelectedOption(optionElement);
                            checkAnswer(option, question.answer);
                        }
                    });
                    optionsElement.appendChild(optionElement);
                });
            } else {
                // For text and number question types
                const inputElement = document.createElement('input');
                inputElement.type = question.questionType === 'number' ? 'number' : 'text';
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit Answer';
                submitButton.className = 'submit-answer';

                submitButton.onclick = () => {
                    if (!answerSelected) {
                        answerSelected = true;
                        checkAnswer(inputElement.value.toString(), question.answer.toString());
                    }
                };

                optionsElement.appendChild(inputElement);
                optionsElement.appendChild(submitButton);
            }
        }

        function highlightSelectedOption(selectedElement) {
            const options = document.getElementById('options').children;
            for (let i = 0; i < options.length; i++) {
                options[i].classList.remove('selected');
            }
            selectedElement.classList.add('selected');
        }

        function checkAnswer(givenAnswer, correctAnswer) {
            const feedbackElement = document.createElement('div');
            feedbackElement.id = 'feedback';
            if (givenAnswer === correctAnswer) {
                score++;
                feedbackElement.textContent = 'Correct!';
                feedbackElement.style.color = 'green';
            } else {
                feedbackElement.textContent = `Wrong. Correct answer: ${correctAnswer}`;
                feedbackElement.style.color = 'red';
            }
            const optionsElement = document.getElementById('options');
            optionsElement.appendChild(feedbackElement);
            updateScore();
        }

        function updateScore() {
            const scoreElement = document.getElementById('score');
            scoreElement.textContent = `Score: ${score}`;
        }

        function endQuiz() {
            questionContainer.innerHTML = `<h1>Quiz Completed!</h1><p>Your final score: ${score}/${currentQuestions.length}</p><button id="home-button">Go to Home</button>`;
            document.getElementById('home-button').addEventListener('click', function () {
                quizContainer.style.display = 'grid';
                questionContainer.style.display = 'none';
            });
        }

        quizContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion();
    }
});
