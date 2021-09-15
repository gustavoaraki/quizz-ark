module.exports = (app) => {
  const { existsOrError, isExist } = app.api.validation;
  const { Choice } = app.api.choice;
  const { Exam } = app.api.exam;
  const { Question } = app.api.question;

  const Activity = app.mongoose.model("Activity", {
    complete: { type: Boolean, required: true, default: false },
    choices: {
      type: [Choice],
    },
    exam: {
      type: app.mongoose.Schema.ObjectId,
      ref: "Exam",
      required: true,
    },
    user: { type: String, required: true },
  });

  const get = async (req, res) => {
    try {
      const activities = await Activity.find();

      return res.send({ activities });
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  const getById = async (req, res) => {
    try {
      existsOrError(req.params.id, "ID da questao não informado.");

      const activity = await Activity.findById(req.params.id);

      return res.send({ activity });
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  const update = async (req, res) => {
    try {
      const { complete, choices } = req.body;
      const activityValidate = await Activity.findById(req.params.id);

      // Validations
      existsOrError(req.params.id, "ID da atividade não informado.");
      existsOrError(activityValidate, "ID da atividade não encontrado!");

      const activity = await Activity.findByIdAndUpdate(
        req.params.id,
        {
          complete,
          choices,
        },
        { new: true }
      );

      await activity.save();

      return res.send({ activity });
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  const remove = async (req, res) => {
    try {
      existsOrError(req.params.id, "ID da atividade não informado.");

      await Activity.findByIdAndRemove(req.params.id);

      return res.send();
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  const nextQuestion = async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.idExam);
      const user = req.user.email;

      // Validations
      existsOrError(req.params.idExam, "ID do exame não informado!");
      existsOrError(exam, "Exame não encontrado!");

      const activity = await verifyActivity(user, exam);
      const question = await getNextQuestion(exam, activity);

      if (isExist(question)) {
        return res.send({ question });
      }
    } catch (err) {
      return res.status(400).send(`${err}`);
    }
  };

  const setAnswer = async (req, res) => {
    try {

      const { exam, choice } = req.body;
      const user = req.user.email;

      // Validations
      existsOrError(choice, "Respostas não informadas!");
      existsOrError(choice.question, "ID da questão não informado!");
      existsOrError(exam, "ID do exame não informado!");

      let questionData = await Question.findById(choice.question);
      let correctAnswer = isCorrect(questionData.answers, choice);
      let activity = await Activity.findOne({ exam: exam, user: user });
      const choices = activity.choices;

      choice.correct = correctAnswer
      choices.push(choice)

      activity = await Activity.findByIdAndUpdate(
        activity._id,
        {
          choices: choices,
        },
        { new: false }
      );

      return res.send({ activity });
    } catch (err) {
      return res.status(400).send(`${err}`);
    }
  };

  function isCorrect(answers, choices) {
    const result = answers
      .map((answer) => {
        if (answer.description == choices.description) {
          return choices.correct && answer.correct ? true : false;
        }
      })
      .filter((response) => {
        return response != null;
      })[0];

    return result;
  }

  async function verifyActivity(user, exam) {
    const activity = await Activity.findOne({ exam: exam._id, user: user});

    if (!isExist(activity)) {
      return await Activity.create({
        complete: false,
        exam: app.mongodb.ObjectId(exam._id),
        user: user,
      });
    }

    return activity;
  }

  async function getNextQuestion(exam, activity) {
    try {
      const theQuestion = await Promise.all(
        exam.questions.map(async (question) => {
          if (!activity.choices) {
            return question;
          }
          if (
            !activity.choices.find(
              (value) => value.question == question._id
            )
          ) {
            return question;
          }
        })
      );

      if (!isExist(theQuestion[0])) {
        if (String(activity.exam) === String(exam._id)) {
          activity = await Activity.findByIdAndUpdate(
            activity._id,
            {
              complete: true,
            },
            { new: false }
          );
        }

        return "Finish Activity";
      }

      return theQuestion;
    } catch (err) {
      throw new Error(`Error process question: ${err}`);
    }
  }

  return { Activity, get, getById, update, remove, nextQuestion, setAnswer };
};
