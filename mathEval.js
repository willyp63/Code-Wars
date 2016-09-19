var calc = function (expression) {
  return calcTokens(tokenize(expression));
};

function calcTokens (tokens) {
  solveParenthesis(tokens);
  solveMultDiv(tokens);
  solveAddSub(tokens);

  return tokens[0];
}

function solveParenthesis (tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '(') {
      const j = closingParenthesisIdx(tokens, i);
      const subExpTokens = tokens.slice(i + 1, j);
      const result = calcTokens(subExpTokens);
      if (tokens[i - 1] === '@') {
        tokens.splice(i - 1, j - i + 2, result * -1);
      } else {
        tokens.splice(i, j - i + 1, result);
      }
    }
  }
}

function closingParenthesisIdx (tokens, openIdx) {
  let parenCount = 1;
  for (let i = openIdx + 1; i < tokens.length; i++) {
    if (tokens[i] === '(') {
      parenCount++;
    } else if (tokens[i] === ')') {
      if (parenCount === 1) {
        return i;
      } else {
        parenCount--;
      }
    }
  }
  return -1;
}

function solveMultDiv (tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'string' && tokens[i].match(/\/|\*/)) {
      const operand1 = tokens[i - 1];
      const operand2 = tokens[i + 1];
      let result = (tokens[i] === '*') ? operand1 * operand2 : operand1 / operand2;
      tokens.splice(i - 1, 3, result);
      i--;
    }
  }
}

function solveAddSub (tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'string' && tokens[i].match(/\-|\+/)) {
      const operand1 = tokens[i - 1];
      const operand2 = tokens[i + 1];
      let result = (tokens[i] === '-') ? operand1 - operand2 : operand1 + operand2;
      tokens.splice(i - 1, 3, result);
      i--;
    }
  }
}

// takes string expressions and parses it into tokens (operators, numbers, and parenthesis)
function tokenize (expression) {
  let atOperator = true;
  const tokens = [];
  for (let i = 0; i < expression.length; i++) {
    const c = expression[i];
    if (c === ' ') {
      continue;
    } else if (c.match(/\(|\)/)) {
      tokens.push(c);
      atOperator = (c === '(');
    } else if (c.match(/\+|\-|\*|\//)) {
      if (atOperator && c === '-') {
        const numStr = numStrAt(expression, i + 1);
        if (numStr) {
          tokens.push(parseFloat(numStr) * -1);
          i += numStr.length;
          atOperator = false;
        } else {
          tokens.push('@');
        }
      } else {
        tokens.push(c);
        atOperator = true;
      }
    } else {
      const numStr = numStrAt(expression, i);
      tokens.push(parseFloat(numStr));
      i += numStr.length - 1;
      atOperator = false;
    }
  }
  return tokens;
}

function numStrAt (expression, idx) {
  let num = '';
  for (let i = idx; i < expression.length; i++) {
    const c = expression[i];
    if (c.match(/\.|\d/)) {
      num += c;
    } else {
      break;
    }
  }
  return num;
}

var tests = [
  ['12* 123/-(-5 + 2)', 492]
];

tests.forEach(test => {
  console.log('#############');
  console.log(test[0]);
  console.log(calc(test[0]));
  console.log(test[1]);
});
