const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const MONGODB_URI = "mongodb://localhost:27017/fsopen-8";
const JWT_SECRET = "lslkdjsosud0sadsakjdas9ud0asjda0sdjasoijd0sajdsa0djsa0j";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String]
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`;

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
      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return book.populate("author");
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
        let token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: "4h" });
        return { value: token };
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
  Author: {
    bookCount: async (root) =>
      await Book.find({ author: root._id }).countDocuments(),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
