const chai = require('chai');
const ArgParser = require('./arg_parser.js');

describe('Arg parser tests', function() {
  describe('Parse sub arg tests', function() {
    it('Can parse an equals argument', function() {
      const result = ArgParser.parseSubArgs('atl=12')
      chai.assert.strictEqual(result.equalsArguments.atl, 12);
    });

    it('Can parse two equals arguments', function() {
      const result = ArgParser.parseSubArgs('atl=12 daaq=3')
      chai.assert.strictEqual(result.equalsArguments.atl, 12);
      chai.assert.strictEqual(result.equalsArguments.daaq, 3);
    });

    it('Can parse a range', function() {
      const result = ArgParser.parseSubArgs('10-20');
      chai.assert.strictEqual(result.range.start, 10);
      chai.assert.strictEqual(result.range.end, 20);
    });

    it('Can parse a keyword', function() {
      const result = ArgParser.parseSubArgs('test');
      chai.assert.strictEqual(result.keywords[0], 'test');
    });

    it('Can parse two keywords', function() {
      const result = ArgParser.parseSubArgs('test test2');
      chai.assert.strictEqual(result.keywords[0], 'test');
      chai.assert.strictEqual(result.keywords[1], 'test2');
    });

    it('Can parse two equals arguments, two keywords, and a range', function() {
      const result = ArgParser.parseSubArgs('atl=12 test 2-5 daaq=3 test2')
      chai.assert.strictEqual(result.equalsArguments.atl, 12);
      chai.assert.strictEqual(result.equalsArguments.daaq, 3);
      chai.assert.strictEqual(result.keywords[0], 'test');
      chai.assert.strictEqual(result.keywords[1], 'test2');
      chai.assert.strictEqual(result.range.start, 2);
      chai.assert.strictEqual(result.range.end, 5);
    });
  });

  describe('Parse args tests', function() {
    it('Can parse a deck', function() {
      const result = ArgParser.parseArgs('deck', true);
      chai.assert.strictEqual(result.decks[0].deckName, 'deck');
    });

    it('Can parse several decks', function() {
      const result = ArgParser.parseArgs('deck+ deck1 + deck2', true);
      chai.assert.strictEqual(result.decks[0].deckName, 'deck');
      chai.assert.strictEqual(result.decks[1].deckName, 'deck1');
      chai.assert.strictEqual(result.decks[2].deckName, 'deck2');
    });

    it('Can parse a deck with arguments', function() {
      const result = ArgParser.parseArgs('n1(atl=5 mc)');
      chai.assert.strictEqual(result.decks[0].deckName, 'n1');
      chai.assert.strictEqual(result.decks[0].deckArgs.equalsArguments.atl, 5);
      chai.assert.strictEqual(result.decks[0].deckArgs.keywords[0], 'mc');
    });

    it('Can parse three decks with arguments and crazy spacing', function() {
      const result = ArgParser.parseArgs('n1(  atl=5 mc ) + n3 + n5( mc daaq = 3 1  -  10  dauq = 9   hardcore)', true);

      chai.assert.strictEqual(result.decks[0].deckName, 'n1');
      chai.assert.strictEqual(result.decks[0].deckArgs.equalsArguments.atl, 5);
      chai.assert.strictEqual(result.decks[0].deckArgs.keywords[0], 'mc');

      chai.assert.strictEqual(result.decks[2].deckName, 'n3');

      chai.assert.strictEqual(result.decks[1].deckName, 'n5');
      chai.assert.strictEqual(result.decks[1].deckArgs.equalsArguments.daaq, 3);
      chai.assert.strictEqual(result.decks[1].deckArgs.equalsArguments.dauq, 9);
      chai.assert.strictEqual(result.decks[1].deckArgs.keywords[0], 'mc');
      chai.assert.strictEqual(result.decks[1].deckArgs.keywords[1], 'hardcore');
      chai.assert.strictEqual(result.decks[1].deckArgs.range.start, 1);
      chai.assert.strictEqual(result.decks[1].deckArgs.range.end, 10);
    });

    it('Can parse decks and also global arguments', function() {
      const result = ArgParser.parseArgs('n1(atl=9) + gn1 atl=10 daaq=9 nodelay 10', true);

      chai.assert.strictEqual(result.decks[1].deckName, 'gn1');

      chai.assert.strictEqual(result.decks[0].deckName, 'n1');
      chai.assert.strictEqual(result.decks[0].deckArgs.equalsArguments.atl, 9);

      chai.assert.strictEqual(result.globalArgs.equalsArguments.atl, 10);
      chai.assert.strictEqual(result.globalArgs.equalsArguments.daaq, 9);
      chai.assert.strictEqual(result.globalArgs.keywords[0], 'nodelay');
      chai.assert.strictEqual(result.globalArgs.keywords[1], 10);
    });

    it('Can parse arguments that do not include deck', function() {
      const result = ArgParser.parseArgs('slow atl=10 daaq=9 nodelay 10', false);

      chai.assert.isEmpty(result.decks);
      chai.assert.deepEqual(result.globalArgs.keywords, ['slow', 'nodelay', 10]);
      chai.assert.deepEqual(result.globalArgs.equalsArguments, { atl: 10, daaq: 9 });
    });

    it('Can handle rgb deck arguments', function() {
      const result = ArgParser.parseArgs('n1(mc color=rgb(0,1,2))');

      chai.assert.deepEqual(result.decks[0].deckArgs.equalsArguments.color, 'rgb(0,1,2)');
    });

    it('Can handle multiple rgb deck arguments', function() {
      const result = ArgParser.parseArgs('n1(color=rgb(0,1,2) mc bgcolor=rgba(5,6,7,8))');

      chai.assert.deepEqual(result.decks[0].deckArgs.equalsArguments.color, 'rgb(0,1,2)');
      chai.assert.deepEqual(result.decks[0].deckArgs.equalsArguments.bgcolor, 'rgba(5,6,7,8)');
    });

    it ('Can handle spaces in rgb arguments', function() {
      const result = ArgParser.parseArgs('n1(bgcolor=rgba(  5  ,  6  ,  7  ,  8  ))');
      chai.assert.deepEqual(result.decks[0].deckArgs.equalsArguments.bgcolor, 'rgba(5,6,7,8)');
    });
  });
});
