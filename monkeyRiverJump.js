function MinStack () {
  this.values = [];
  this.mins = [];
}

MinStack.prototype = {
  peak: function () {
    return this.values[this.values.length - 1];
  },
  min: function () {
    const min = this.mins[this.mins.length - 1];
    return (min === undefined) ? Infinity : min;
  },
  push: function (value) {
    this.values.push(value);
    const oldMin = this.min();
    if (oldMin === undefined || value < oldMin) {
      this.mins.push(value);
    } else {
      this.mins.push(oldMin);
    }
  },
  pop: function () {
    this.mins.pop();
    return this.values.pop();
  },
  length: function () {
    return this.values.length;
  }
};

function MinQueue () {
  this.inStack = new MinStack();
  this.outStack = new MinStack();
}

MinQueue.prototype = {
  min: function () {
    return Math.min(this.inStack.min(), this.outStack.min());
  },
  enqueue: function (value) {
    this.inStack.push(value);
  },
  dequeue: function () {
    // if nothing is in outstack, flip the stacks
    if (this.outStack.peak() === undefined) {
      this.flipStacks();
    }
    return this.outStack.pop();
  },
  flipStacks: function () {
    while (this.inStack.peak() !== undefined) {
      this.outStack.push(this.inStack.pop());
    }
  },
  length: function () {
    return this.inStack.length() + this.outStack.length();
  }
};

function earliestJumpTime (stones, jumpDistance) {
  // dynamic programming array
  const earliestTimes = [0].concat(stones).concat([0]);

  // window of reachable predecessor times
  const reachableTimes = new MinQueue();
  reachableTimes.enqueue(earliestTimes[0]);

  // bottom-up
  for (let i = 1; i < earliestTimes.length; i++) {
    let stoneTime = earliestTimes[i];
    if (stoneTime === -1) {
      // can't be reached
      earliestTimes[i] = Infinity;
    } else {
      // limited by its earliest predecessor or its self
      earliestTimes[i] = Math.max(reachableTimes.min(), stoneTime);
    }

    // shift reachable times window
    reachableTimes.enqueue(earliestTimes[i]);
    if (reachableTimes.length() > jumpDistance) {
      reachableTimes.dequeue();
    }
  }

  // final answer is last sub-problem in bottom-up
  let result = earliestTimes[earliestTimes.length - 1];
  return (result === Infinity) ? -1 : result;
}

// random river
const N = 100000;
const randomStones = [];
for (var i = 0; i < N; i++) {
  if (Math.random() < 0.1) {
    randomStones.push(-1);
  } else {
    randomStones.push(Math.floor(Math.random() * Math.pow(2, 52)));
  }
}
const randomDistance = Math.ceil(Math.random() * (randomStones.length + 1));

console.log(earliestJumpTime(randomStones, randomDistance));
