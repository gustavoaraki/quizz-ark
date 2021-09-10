module.exports = (app) => {
  const { existsOrError } = app.api.validation;
  const { Exam } = app.api.exam;
  const { Answer } = app.api.answer;

  const Question = app.mongoose.model("Question", {
    description: {
      type: String,
      required: [true, "Question description required!"],
    },
    answers: {
      type: [Answer],
      validate: existsOrError
    },
    exam: {
      type: app.mongoose.Schema.ObjectId,
      ref: "Exam",
      required: [true, "ID exam required"],
    },
  });

  function atLeastOneTrueAnswer(answers) {
    return answers.some((val) => val.correct == true);
  }

  const get = async (req, res) => {
    try {
      const questions = await Question.find();
      return res.send({ questions });
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  const getById = async (req, res) => {
    try {
      existsOrError(req.params.id, "ID da questao não informado.");

      const question = await Question.findById(req.params.id);

      return res.send({ question });
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  const save = async (req, res) => {
    try {
      const exam = await Exam.findById(req.body.exam);
      const answers = req.body.answers;

      // Validations
      existsOrError(req.body.exam, "ID do exame não informado!");
      existsOrError(exam, "ID do exame não encontrado!");
      existsOrError(
        atLeastOneTrueAnswer(answers),
        "Uma resposta verdadeira deve ser informada!"
      );

      const questions = exam.questions;
      const question = await Question.create(req.body).then(
        (res) => console.log(`Created question document`),
        (err) => console.error(`Something went wrong: ${err}`)
      );

      questions.push(question);

      await Exam.findByIdAndUpdate(
        exam._id,
        {
          questions,
        },
        { new: true }
      ).then(
        (res) => console.log(`Updated question document`),
        (err) => console.error(`Something went wrong: ${err}`)
      );

      await question.save();

      return res.send({ question });
    } catch (err) {
      console.error(err);
      return res.status(400).send(err);
    }
  };

  const update = async (req, res) => {
    try {
      const { description, answers } = req.body;
      const questionID = req.params.id;
      const questionValidate = await Question.findById(req.params.id);

      // Validations
      existsOrError(questionID, "ID da questão não informado.");
      existsOrError(questionValidate, "ID da questão não encontrado!");
      existsOrError(
        atLeastOneTrueAnswer(answers),
        "Uma resposta verdadeira deve ser informada!"
      );

      const question = await Question.findByIdAndUpdate(
        req.params.id,
        {
          description,
          answers,
        },
        { new: false }
      )

      await question.save();
      await Exam.updateOne(
        { "questions._id": app.mongodb.ObjectId(question._id) },
        { "questions.$": question }
      )

      return res.send({ question });
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  const remove = async (req, res) => {
    try {
      existsOrError(req.params.id, "ID da questão não informado.");
      const question = await Question.findById(req.params.id);
      const exam = await Exam.findById(question.exam);
      existsOrError(exam, "Exame não encontrado.");

      await Question.findByIdAndRemove(req.params.id);
      const questions = [];

      await Exam.findByIdAndUpdate(
        exam._id,
        {
          questions,
        },
        { new: true }
      );

      return res.send();
    } catch (err) {
      console.error(err);
      return res.status(400).send(err);
    }
  };

  return { Question, get, getById, save, update, remove };
};
