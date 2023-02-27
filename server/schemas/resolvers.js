const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // Adding context to query, we can retreive the logged in user without specifically searching for them
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User
        .findOne({ _id: context.user._id })
        .select(
          "-__v -password")
        .populate('books');
        return userData;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
    },
    // Adding third argument to the resolver to access data in our `context`
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData }},
          { new: true},
        )
        .populate('books');
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: {bookId } } },
          { new: true},
        );
        return updatedUser;
      }
    //   If user attempts to execute this mutation and is not logged in, throw an error
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
