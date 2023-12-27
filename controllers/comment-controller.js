const { Comment, User, Restaurant } = require('../models')

const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User didn't exist!")
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return Promise.all([
          Comment.create({
            text,
            restaurantId,
            userId
          }),
          restaurant.increment('commentCounts')
        ])
      })
      .then(() => {
        res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  },
  deleteComment: (req, res, next) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        console.log(comment.restaurantId)
        return Promise.all([
          comment.destroy(),
          Restaurant.decrement('commentCounts', { where: { id: comment.restaurantId } })
        ])
      })
      .then(([deletedComment, _]) => res.redirect(`/restaurants/${deletedComment.restaurantId}`))
      .catch(err => next(err))
  }
}

module.exports = commentController
