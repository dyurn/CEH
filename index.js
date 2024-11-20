//D3.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Configuration du moteur EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'your_secret_key',
        resave: false, 
        saveUninitialized: true, 
        cookie: { secure: false } 
    })
);

app.use((req, res, next) => {
    if (!req.session.stats) {
        req.session.stats = {
            correctAnswers: 0,
            incorrectAnswers: 0,
            incorrectQuestionIds: [] // Stocke les IDs des questions mal répondues
        };
    }
    next();
});

const dbConfig = {
    host: 'db4free.net',
    user: 'thomasbott',
    password: 'adrienduprez',
    database: 'ceh_2024',
};

let questions = []; // Stocke toutes les questions après récupération depuis la base de données

// Charger toutes les questions de la base de données au démarrage
async function loadQuestions() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM questions_answers');
        connection.end();
        questions = rows;
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Route principale
app.get('/', (req, res) => {
    res.render('index', { totalQuestions: questions.length });
});

app.get('/stats', (req, res) => {
    const stats = req.session.stats;
    const incorrectQuestions = questions
        .filter((q) => stats.incorrectQuestionIds.includes(q.id))
        .map((q) => ({
            id: q.id,
            question: q.question,
            answers: {
                A: q.answer_a,
                B: q.answer_b,
                C: q.answer_c,
                D: q.answer_d,
            },
            correct: q.correct.split(','), // Transforme les réponses correctes en tableau
        }));

    res.render('stats', { stats, incorrectQuestions });
});


// Route pour afficher une question aléatoire
app.get('/question', (req, res) => {
    if (questions.length === 0) {
        return res.status(500).send('No questions available');
    }

    // Sélection d'une question aléatoire
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    const correctAnswers = question.correct.split(',');
    const inputType = correctAnswers.length > 1 ? 'checkbox' : 'radio';

    res.render('question', {
        question: {
            question: question.question,
            answers: {
                A: question.answer_a,
                B: question.answer_b,
                C: question.answer_c,
                D: question.answer_d,
            },
            correct: correctAnswers,
        },
        inputType,
        questionIndex: randomIndex,
        userAnswer: undefined,
        isCorrect: undefined,
    });
});

app.post('/question', (req, res) => {
    const { action, questionIndex } = req.body;

    if (action === 'submit') {
        const userAnswers = Array.isArray(req.body.answers) ? req.body.answers : [req.body.answers];
        const question = questions[questionIndex];
        const correctAnswers = question.correct.split(',');

        const isCorrect =
            userAnswers.length === correctAnswers.length &&
            correctAnswers.every((answer) => userAnswers.includes(answer));

        const inputType = correctAnswers.length > 1 ? 'checkbox' : 'radio';

        // Mise à jour des statistiques dans la session
        if (isCorrect) {
            req.session.stats.correctAnswers += 1;
        } else {
            req.session.stats.incorrectAnswers += 1;
            req.session.stats.incorrectQuestionIds.push(question.id); // Stocke l'ID de la question incorrecte
        }

        res.render('question', {
            question: {
                question: question.question,
                answers: {
                    A: question.answer_a,
                    B: question.answer_b,
                    C: question.answer_c,
                    D: question.answer_d,
                },
                correct: correctAnswers,
            },
            inputType,
            questionIndex,
            userAnswer: userAnswers,
            isCorrect,
        });
    } else if (action === 'next') {
        res.redirect('/question');
    }
});

// Route pour rejouer uniquement les mauvaises questions
app.get('/replay-incorrect', (req, res) => {
    const stats = req.session.stats;

    // Filtre les questions incorrectes
    const incorrectQuestions = questions.filter((q) =>
        stats.incorrectQuestionIds.includes(q.id)
    );

    // Vérifie s'il y a des mauvaises questions
    if (incorrectQuestions.length === 0) {
        return res.redirect('/stats'); // Redirige si aucune question incorrecte
    }

    // Stocke les mauvaises questions dans la session pour le mode rejouer
    req.session.replayQuestions = incorrectQuestions;
    req.session.currentReplayIndex = 0;

    res.redirect('/replay-question'); // Redirige vers le mode rejouer
});

// Route pour afficher une question dans le mode "Rejouer"
app.get('/replay-question', (req, res) => {
    const replayQuestions = req.session.replayQuestions || [];
    const currentReplayIndex = req.session.currentReplayIndex || 0;

    if (currentReplayIndex >= replayQuestions.length) {
        // Une fois toutes les questions rejouées, redirige vers les statistiques
        return res.redirect('/stats');
    }

    const question = replayQuestions[currentReplayIndex];

    res.render('question', {
        question: {
            question: question.question,
            answers: {
                A: question.answer_a,
                B: question.answer_b,
                C: question.answer_c,
                D: question.answer_d,
            },
            correct: question.correct.split(','), // Convertir les bonnes réponses en tableau
        },
        inputType: question.correct.split(',').length > 1 ? 'checkbox' : 'radio',
        questionIndex: currentReplayIndex,
        isReplay: true,
    });
});

// Route pour soumettre une réponse dans le mode "Rejouer"
app.post('/replay-question', (req, res) => {
    const replayQuestions = req.session.replayQuestions || [];
    const currentReplayIndex = req.session.currentReplayIndex || 0;

    const userAnswers = Array.isArray(req.body.answers) ? req.body.answers : [req.body.answers];
    const question = replayQuestions[currentReplayIndex];
    const correctAnswers = question.correct.split(',');

    const isCorrect =
        userAnswers.length === correctAnswers.length &&
        correctAnswers.every((answer) => userAnswers.includes(answer));

    // Mise à jour des statistiques rejouées
    if (isCorrect) {
        req.session.stats.correctAnswers += 1;
    } else {
        req.session.stats.incorrectAnswers += 1;
    }

    // Passe à la question suivante
    req.session.currentReplayIndex += 1;

    res.redirect('/replay-question');
});

loadQuestions().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
