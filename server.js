const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const serviceAccount = require('./chave_firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/registro', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await admin.auth().createUser({
      email,
      password,
    });
    res.json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await admin.auth().getUserByEmail(email);
    // Compare a senha com a senha do usuário no Firebase de forma segura.
    // Aqui é apenas um exemplo, você precisará usar a lógica adequada para comparar senhas de forma segura.
    if (user.passwordHash === password) {
      const token = jwt.sign({ email }, 'secret_key');
      res.json({ token });
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/protected', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extrai o token do cabeçalho de autorização
    const decoded = jwt.verify(token, 'secret_key');
    res.send(decoded);
  } catch (error) {
    console.error('Erro de token:', error);
    res.status(401).send('Token inválido');
  }
});

app.listen(3000, () => {
  console.log('O servidor está rodando na porta 3000');
});
