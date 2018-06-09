const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Note'
    }
  ]
});

// gets all article notes for a specified article
ArticleSchema.statics.getAllNotes = function(articleId, callback) {
  Article.find({ _id: articleId })
    .populate('notes')
    .then(res => callback(res[0].notes, null))
    .catch(err => callback(null, err));
};

// removes note associated with an article
ArticleSchema.statics.removeNote = function(articleId, noteId, callback) {
  Article.update({ _id: articleId }, { $pull: { notes: { $in: [noteId] } } })
    .then(result => callback(result, null))
    .catch(err => callback(null, err));
};

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
