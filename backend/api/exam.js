module.exports = (app) => {
  const { existsOrError, notExistsOrError } = app.api.validation;

  const Exam = app.mongoose.model("Exam", {
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
    questions: [],
  });

  const get = async (req, res) => {
    try {
      const exams = await Exam.find();

      return res.send({ exams });
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  const getById = async (req, res) => {
    try {
      existsOrError(req.params.id, "Código do exame não informado.");

      const exam = await Exam.findById(req.params.id);

      return res.send({ exam });
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  const save = async (req, res) => {
    try {
      const exam = await Exam.create({ ...req.body, user: req.user.email });

      await exam.save().then(
        (res) => console.log(`Created exam document`),
        (err) => console.error(`Something went wrong: ${err}`)
      );

      return res.send({ exam });
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  const update = async (req, res) => {
    try {
      const { title, type, description } = req.body;

      existsOrError(req.params.id, "Código do exame não informado.");
      existsOrError(title, "Titulo não informado");

      const exam = await Exam.findByIdAndUpdate(
        req.params.id,
        {
          title,
          type,
          description,
        },
        { new: false }
      )

      await exam.save();

      return res.send();
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  const remove = async (req, res) => {
    try {
      existsOrError(req.params.id, "Código do exame não informado.");
      const exam = await Exam.findById(req.params.id);
      notExistsOrError(exam.questions, "Existe questões associadas ao exame.");

      await Exam.findByIdAndRemove(req.params.id);

      return res.send();
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  return { Exam, get, getById, save, update, remove };
};
