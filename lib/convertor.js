const TypesMap = require('./types_map.js');

function protoToTsType(p) {
  if (TypesMap[p]) {
    return TypesMap[p];
  }

  return p;
}

function parseProtobuf(protobuf) {
  let parsed = '';

  for (const line of protobuf.split('\n')) {
    parsed += parseProtobufLine(line);
    parsed += '\n';
  }
  return parsed;
}

function parseProtobufLine(line) {
  if (!line) {
    return '';
  }

  // todo 删除非message的代码块
  // todo 平铺嵌套的message

  const indent = line.length - line.trimLeft().length;
  const indentChar = line[0];

  const tokens = line.trim().split(' ').filter(Boolean);

  let isRepeated = false;
  switch (tokens[0]) {
    case '//':
      return line;
    case '}':
      return '}';
    case 'message':
      return 'interface ' + tokens[1] + ' {';
    case 'repeated':
      isRepeated = true;
      tokens.shift();
  }

  return `${indentChar.repeat(indent)}${tokens[1]}: ${protoToTsType(tokens[0])}${isRepeated ? '[]' : ''}`;
}

module.exports = parseProtobuf;
