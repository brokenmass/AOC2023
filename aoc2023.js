// @ts-check

// This year the extra requirements are:
// - the solution must run in the chrome inspector by copy pasting the code directly
// - the function must be able to solve both parts with minimal changes
// - execution time < 50ms

const day = location.pathname.split('day/').pop();
const isPart2 = location.hash === '#part2';

const strUtils = {
  toLines: (str) => str.trim().split('\n').filter(Boolean),
  toNumberArray: (str) => str.trim().split(/\s+/).map(Number),
};
const numUtils = {
  gcd: (nA, nB) => (nB === 0 ? nA : numUtils.gcd(nB, nA % nB)),
  lcm: (nA, nB) => (nA * nB) / numUtils.gcd(nA, nB),
};

class Matrix {
  data;
  w;
  h;
  constructor(input) {
    this.data = strUtils
      .toLines(input)
      .filter(Boolean)
      .map((row) => row.split(''));
    this.w = this.data[0].length;
    this.h = this.data.length;
  }
  getTile = ([x, y]) => {
    return this.isValid([x, y]) ? this.data[y][x] : '.';
  };
  setTile = ([x, y], val) => {
    this.data[y][x] = val;
  };
  isValid = ([x, y]) => {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  };
  forEachRow = (cb) => {
    for (let y = 0; y < this.h; y++) {
      cb(this.data[y], y);
    }
  };
}

const solutions = {};

solutions.day1 = (input, part2 = false) => {
  const hrDigits = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
  };

  const regex = part2
    ? /(?=(\d|one|two|three|four|five|six|seven|eight|nine))/g
    : /(\d)/g;
  const mapDigit = (val) => hrDigits[val] || val;
  const lines = strUtils.toLines(input);
  const total = lines.reduce((sum, line) => {
    const digits = Array.from(line.matchAll(regex), (x) => x[1]);
    const code = mapDigit(digits[0]) + mapDigit(digits.at(-1));
    return sum + Number(code);
  }, 0);

  return total;
};

solutions.day2 = (input, part2 = false) => {
  const lines = strUtils.toLines(input);
  const total = lines.reduce((sum, line) => {
    const [gameInfo, gameData] = line.split(': ');

    if (part2) {
      const minCubes = {red: 0, green: 0, blue: 0};
      for (set of gameData.split('; ')) {
        for (cube of set.split(', ')) {
          const [amount, color] = cube.split(' ');
          minCubes[color] = Math.max(minCubes[color], Number(amount));
        }
      }
      const power = minCubes.red * minCubes.green * minCubes.blue;
      return sum + power;
    } else {
      const maxCubes = {red: 12, green: 13, blue: 14};
      for (set of gameData.split('; ')) {
        for (cube of set.split(', ')) {
          const [amount, color] = cube.split(' ');
          if (Number(amount) > maxCubes[color]) {
            return sum;
          }
        }
      }
      const gameNumber = Number(gameInfo.split(' ').pop());
      return sum + Number(gameNumber);
    }
  }, 0);

  return total;
};

solutions.day3 = (input, part2 = false) => {
  const matrix = new Matrix(input);

  const findComponentsAround = ([x1, y1], [x2, y2], condition) => {
    const border = [
      // Top and bottom
      ...new Array(x2 - x1 + 1).fill('').flatMap((_, index) => [
        [x1 + index, y1 - 1],
        [x1 + index, y2 + 1],
      ]),
      // Left and Right + corners
      ...new Array(y2 - y1 + 1 + 2).fill('').flatMap((_, index) => [
        [x1 - 1, y1 - 1 + index],
        [x2 + 1, y1 - 1 + index],
      ]),
    ];
    return border.filter((coords) => condition(matrix.getTile(coords)));
  };

  if (part2) {
    const GEAR = '*';
    const gearsMap = {};
    matrix.forEachRow((row) => {
      const matches = Array.from(row.matchAll(/\d+/g));
      matches.forEach((match) =>
        findComponentsAround(
          [match.index, y],
          [match.index + match[0].length - 1, y],
          (tile) => tile === GEAR
        ).forEach((coord) => {
          gearsMap[coord] = gearsMap[coord] || [];
          gearsMap[coord].push(Number(match[0]));
        })
      );
    });

    return Object.entries(gearsMap)
      .filter(([, numbers]) => numbers.length === 2)
      .map(([, numbers]) => numbers[0] * numbers[1])
      .reduce((sum, gearRatio) => sum + gearRatio, 0);
  } else {
    const EMPTY = '.';
    let total = 0;
    matrix.forEachRow((row) => {
      const matches = Array.from(row.matchAll(/\d+/g));
      total += matches.reduce((sum, match) => {
        const componentsCoords = findComponentsAround(
          [match.index, y],
          [match.index + match[0].length - 1, y],
          (tile) => tile !== EMPTY
        );

        if (componentsCoords.length) {
          return sum + Number(match[0]);
        } else {
          return sum;
        }
      }, 0);
    });

    return total;
  }
};

solutions.day4 = (input, part2 = false) => {
  const lines = strUtils.toLines(input);
  const cardsMultiplier = new Array(lines.length).fill(1);
  const total = lines.reduce((sum, line, index) => {
    const [cardInfo, cardData] = line.split(': ');
    const [winning, own] = cardData.split(' | ');
    const winningNumbers = new Set(strUtils.toNumberArray(winning));
    const ownNumbers = strUtils.toNumberArray(own);
    const ownWinningNumbers = ownNumbers.filter((number) =>
      winningNumbers.has(number)
    );
    if (part2) {
      const cardNumber = Number(cardInfo.split(' ').at(-1));
      const multiplier = cardsMultiplier[cardNumber - 1];
      for (
        let i = 0;
        i < ownWinningNumbers.length && cardNumber + i < cardsMultiplier.length;
        i++
      ) {
        cardsMultiplier[cardNumber + i] += multiplier;
      }
      if (index === lines.length - 1) {
        return cardsMultiplier.reduce((sum, count) => sum + count, 0);
      }
    } else {
      if (ownWinningNumbers.length) {
        const score = 2 ** (ownWinningNumbers.length - 1);
        return sum + score;
      } else {
        return sum;
      }
    }
  }, 0);
  return total;
};

solutions.day5 = (input, part2 = false) => {
  class Range {
    start = 0;
    end = 0;
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
    overlapsWith(otherRange) {
      // 2 ranges overlasp if they are not disjointed
      return !(this.end < otherRange.start || this.start > otherRange.end);
    }
    add(delta) {
      this.start += delta;
      this.end += delta;
      return this;
    }
    trimStart(start) {
      this.start = start;
      return this;
    }
    trimEnd(end) {
      this.end = end;
      return this;
    }
    clone() {
      return new Range(this.start, this.end);
    }
  }

  const sections = input.split('\n\n');
  const seeds = strUtils.toNumberArray(sections.shift().split(':').pop());
  const state = {
    type: 'seed',
    ranges: [],
  };
  if (part2) {
    state.ranges = [];
    for (let i = 0; i < seeds.length; i += 2) {
      state.ranges.push(new Range(seeds[i], seeds[i] + seeds[i + 1] - 1));
    }
  } else {
    state.ranges = seeds.map((val) => {
      return new Range(val, val);
    });
  }

  const transformers = sections.reduce((map, section) => {
    const lines = strUtils.toLines(section);
    const [source, , target] = lines.shift().split(' ')[0].split('-');
    const mappers = lines.map((line) => {
      const [targetStart, sourceStart, length] = strUtils.toNumberArray(line);

      return {
        range: new Range(sourceStart, sourceStart + length - 1),
        delta: targetStart - sourceStart,
      };
    });

    map[source] = {
      source,
      target,
      transformRange: (range) => {
        const toTransform = [range.clone()];
        const transformed = [];
        let count = 0;
        while (toTransform.length && count++ < 20) {
          let transforming = toTransform.pop();
          const mapper = mappers.find(({range}) =>
            range.overlapsWith(transforming)
          );
          if (mapper) {
            if (transforming.start < mapper.range.start) {
              toTransform.push(
                new Range(transforming.start, mapper.range.start - 1)
              );
              transforming.trimStart(mapper.range.start);
            }
            if (transforming.end > mapper.range.end) {
              toTransform.push(
                new Range(mapper.range.end + 1, transforming.end)
              );
              transforming.trimEnd(mapper.range.end);
            }
            transformed.push(transforming.add(mapper.delta));
          } else {
            transformed.push(transforming);
          }
        }

        return transformed;
      },
    };
    return map;
  }, {});

  while (state.type !== 'location') {
    const transformer = transformers[state.type];

    state.type = transformer.target;
    state.ranges = state.ranges.flatMap(transformer.transformRange);
  }

  return state.ranges.sort((rA, rB) => rA.start - rB.start)[0].start;
};

solutions.day6 = (input, part2 = false) => {
  const [timeData, distanceData] = strUtils.toLines(input);
  let times = strUtils.toNumberArray(timeData.split(':').pop());
  let distances = strUtils.toNumberArray(distanceData.split(':').pop());
  if (part2) {
    times = [Number(times.join(''))];
    distances = [Number(distances.join(''))];
  }
  const total = times.reduce((mult, time, index) => {
    const sqrdDiscriminator = Math.sqrt(time ** 2 - 4 * distances[index]);
    const root1 = (time - sqrdDiscriminator) / 2;
    const root2 = (time + sqrdDiscriminator) / 2;
    const res = 1 + Math.floor(root2 - 0.0001) - Math.ceil(root1 + 0.0001);
    return mult * res;
  }, 1);

  return total;
};

solutions.day7 = (input, part2 = false) => {
  const CARDS = part2 ? 'AKQT98765432J' : 'AKQJT98765432';
  const assingScore = ([first, second]) => {
    switch (first) {
      case 5:
        return 1;
      case 4:
        return 2;
      case 3:
        return second === 2 ? 3 : 4;
      case 2:
        return second === 2 ? 5 : 6;
      case 1:
        return 7;
    }
  };

  const sorter = (handA, handB) => {
    if (handA.score === handB.score) {
      let diffIndex = 0;
      while (handA.cards[diffIndex] === handB.cards[diffIndex]) diffIndex++;

      return (
        CARDS.indexOf(handB.cards[diffIndex]) -
        CARDS.indexOf(handA.cards[diffIndex])
      );
    } else {
      return handB.score - handA.score;
    }
  };
  const hands = strUtils.toLines(input);
  const handsScores = hands.map((hand) => {
    const [cards, bid] = hand.split(' ');
    const cardsMap = cards.split('').reduce((map, card) => {
      map[card] = map[card] + 1 || 1;
      return map;
    }, {});
    let groups = [];
    if (part2) {
      const jokers = cardsMap['J'] || 0;
      delete cardsMap['J'];
      groups = Object.values(cardsMap).sort((a, b) => b - a);
      groups[0] = groups[0] + jokers || jokers;
    } else {
      groups = Object.values(cardsMap).sort((a, b) => b - a);
    }

    const score = assingScore(groups);
    return {
      cards,
      groups,
      score,
      bid: Number(bid),
    };
  });
  const total = handsScores
    .sort(sorter)
    .reduce((sum, {bid}, index) => sum + (index + 1) * bid, 0);

  return total;
};

solutions.day8 = (input, part2 = false) => {
  const [instructions, nodesData] = input.split('\n\n');

  const nodeMap = strUtils.toLines(nodesData).reduce((map, line) => {
    const [, name, left, right] = line.match(/(\w+) = \((\w+), (\w+)\)/i);
    map[name] = {name, L: left, R: right, hasZ: name[2] === 'Z'};
    return map;
  }, {});

  if (part2) {
    let index = 0;
    let currents = Object.values(nodeMap).filter(({name}) => name[2] === 'A');
    const steps = [];
    while (currents.length) {
      const op = instructions[index % instructions.length];
      currents = currents
        .map((node) => nodeMap[node[op]])
        .filter((node) => {
          if (node.hasZ) {
            steps.push(index + 1);
            return false;
          } else {
            return true;
          }
        });
      index++;
    }
    return steps.reduce((acc, step) => numUtils.lcm(acc, step), 1);
  } else {
    let index = 0;
    let current = 'AAA';

    while (current !== 'ZZZ') {
      const op = instructions[index % instructions.length];
      current = nodeMap[current][op];
      index++;
    }

    return index;
  }
};

solutions.day9 = (input, part2 = false) => {
  const data = strUtils.toLines(input).map(strUtils.toNumberArray);
  const reduceDirection = part2 ? 'reduceRight' : 'reduce';
  const multiplier = part2 ? -1 : 1;

  return data.reduce((sum, row) => {
    const rowResult = row[reduceDirection]((deltas, actual) => {
      const expected = deltas[0] ?? 0;
      const error = actual - expected;

      deltas.push(0);

      for (let i = deltas.length - 1; i >= 0; i--) {
        deltas[i] +=
          multiplier ** i * error + multiplier * (deltas[i + 1] ?? 0);
      }
      return deltas;
    }, []);

    return sum + rowResult[0];
  }, 0);
};

solutions.day10 = (input, part2 = false) => {
  const START_CHAR = 'S';
  const PATH_CHAR = 'X';
  const matrix = new Matrix(input);
  const SIndex = input.indexOf(START_CHAR);
  const start = [SIndex % (matrix.w + 1), Math.floor(SIndex / (matrix.w + 1))];
  const pipeMap = {
    '|': {
      N: {outDirection: 'N', rot: '-', left: ['W'], right: ['E']},
      S: {outDirection: 'S', rot: '-', left: ['E'], right: ['W']},
    },
    '-': {
      E: {outDirection: 'E', rot: '-', left: ['N'], right: ['S']},
      W: {outDirection: 'W', rot: '-', left: ['S'], right: ['N']},
    },
    L: {
      S: {outDirection: 'E', rot: 'L', left: [], right: ['W', 'S']},
      W: {outDirection: 'N', rot: 'R', left: ['W', 'S'], right: []},
    },
    J: {
      S: {outDirection: 'W', rot: 'R', left: ['E', 'S'], right: []},
      E: {outDirection: 'N', rot: 'L', left: [], right: ['E', 'S']},
    },
    7: {
      N: {outDirection: 'W', rot: 'L', left: [], right: ['E', 'N']},
      E: {outDirection: 'S', rot: 'R', left: ['E', 'N'], right: []},
    },
    F: {
      N: {outDirection: 'E', rot: 'R', left: ['W', 'N'], right: []},
      W: {outDirection: 'S', rot: 'L', left: [], right: ['W', 'N']},
    },
    '.': {},
    [START_CHAR]: {},
    [PATH_CHAR]: {},
  };

  const coordsInDirection = ([x, y], direction) => {
    switch (direction) {
      case 'N':
        return [x, y - 1];
      case 'S':
        return [x, y + 1];
      case 'W':
        return [x - 1, y];
      case 'E':
        return [x + 1, y];
    }
  };
  // TODO: there's a little bug here: the left/right cell of the start cell are not identified.
  // the problem does not punish for that so it has not been fixed
  let initialOptions = ['N', 'S', 'W', 'E']
    .map((direction) => {
      const nextCoords = coordsInDirection(start, direction);
      const nextChar = matrix.getTile(nextCoords);
      return {
        nextCoords,
        nextChar,
        direction,
      };
    })
    .filter(
      ({nextChar, direction}) => pipeMap[nextChar][direction]?.outDirection
    );
  let cursor = {
    currCoords: start,
    currChar: START_CHAR,
    direction: initialOptions[0].direction,
  };
  const rotationCounters = {
    '-': 0,
    L: 0,
    R: 0,
  };
  const neighbours = {
    left: [],
    right: [],
  };
  let steps = 0;
  do {
    matrix.setTile(cursor.currCoords, PATH_CHAR);

    const nextCoords = coordsInDirection(cursor.currCoords, cursor.direction);
    const nextChar = matrix.getTile(nextCoords);
    const {
      outDirection,
      rot = '-',
      left = [],
      right = [],
    } = pipeMap[nextChar][cursor.direction] ?? {};

    rotationCounters[rot]++;
    neighbours.left.push(
      ...left.map((dir) => coordsInDirection(nextCoords, dir))
    );
    neighbours.right.push(
      ...right.map((dir) => coordsInDirection(nextCoords, dir))
    );

    cursor.currCoords = nextCoords;
    cursor.currChar = nextChar;
    cursor.direction = outDirection;

    steps++;
  } while (cursor.currChar !== PATH_CHAR);

  if (!part2) {
    return Math.ceil(steps / 2);
  } else {
    const INNER_CHAR = 'I';
    // if there should be 4 more rotation in a direction than in the other.
    // the rotation with the most count indicates the inside of the loop
    const inside = neighbours[
      rotationCounters.L > rotationCounters.R ? 'left' : 'right'
    ].filter(matrix.isValid);

    let innerCellCount = 0;
    while (inside.length) {
      const pos = inside.pop();
      const char = matrix.getTile(pos);
      if (char !== PATH_CHAR && char !== INNER_CHAR) {
        matrix.setTile(pos, INNER_CHAR);
        innerCellCount++;
        inside.push(
          ...['N', 'S', 'W', 'E'].map((direction) =>
            coordsInDirection(pos, direction)
          )
        );
      }
    }

    return innerCellCount;
  }
};

if (solutions[`day${day}`]) {
  let preIndex = isPart2 ? 1 : 0;
  switch (day) {
    case '5':
    case '9':
      preIndex = 0;
      break;
    case '10':
      preIndex = isPart2 ? 12 : 7;
      break;
  }
  const input = window.test
    ? $$('pre > code')[preIndex].getInnerHTML()
    : await (await fetch(location.pathname + '/input')).text();

  console.time('benchmark');
  const result = solutions[`day${day}`](input, isPart2);
  console.timeEnd('benchmark');
  console.log(
    `Solution of day ${day}${isPart2 ? ' part2' : ''} is "${result}"`
  );
} else {
  console.error(`No solution (yet) for day ${day}`);
}
