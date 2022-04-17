const { PubSub } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const { AuthenticationError, UserInputError } = require("apollo-server");
const { JWT_SECRET } = require("./env");

const pubsub = new PubSub();
const resolvers = {
  Query: {
    bookCount: async () => await Book.find().countDocuments(),
    authorCount: async () => await Author.find().countDocuments(),
    allBooks: async (root, args) => {
      const { author: authorName, genre } = args;

      const query = authorName || genre ? { $and: [] } : {};
      let author = authorName
        ? await Author.findOne({ name: authorName })
        : null;

      if (!author && authorName) {
        return [];
      }
      if (authorName) {
        query["$and"].push({ author: author._id });
      }
      if (genre) {
        query["$and"].push({ genres: { $in: [genre] } });
      }

      return await Book.find(query).populate("author");
    },
    allAuthors: async () => await Author.find(),
    me: (root, args, { currentUser }) => {
      return currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("Unauthenticated");
      }
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        try {
          author = await new Author({ name: args.author }).save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      let book = new Book({ ...args, author: author._id });
      try {
        await book.save();
        author.books.push(book._id);
        console.log(author);
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      const saved = book.populate("author");
      pubsub.publish("BOOK_ADDED", { bookAdded: saved });
      return saved;
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("Unauthenticated");
      }
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      author.born = args.setBornTo;
      try {
        const edited = await author.save();
        return edited;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    createUser: async (root, args) => {
      const { username, favoriteGenre } = args;
      try {
        let newUser = await new User({ username, favoriteGenre }).save();
        return newUser;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      const { username, password } = args;
      const user = await User.findOne({ username });
      if (!user || password !== "password") {
        throw new UserInputError("wrong credentials");
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      try {
        let token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: "8h" });
        return { value: token };
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
  Subscription: {
    bookAdded: { subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]) },
  },
  Author: {
    bookCount: async (root) => root.books.length,
  },
};

module.exports = resolvers;
