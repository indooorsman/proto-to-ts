const { parse } = require('proto-parser');
const TypesMap = require('./types_map.js');

const parseNode = (node, result = []) => {
  if (!node || {}.toString.call(node) !== '[object Object]') {
    return result;
  }
  const { name, syntaxType, nested, fields } = node;
  if (syntaxType !== 'MessageDefinition') {
    if (!nested) {
      for (let k in node) {
        if (node.hasOwnProperty(k)) {
          parseNode(node[k], result);
        }
      }
    } else {
      parseNode(nested, result);
    }
  } else {
    const interfaceTplVars = {
      name: name,
      props: [],
      children: []
    };

    if (fields && Object.keys(fields).length) {
      for (let f in fields) {
        if (!fields.hasOwnProperty(f)) {
          continue;
        }
        const v = fields[f];
        const fname = v.name;
        let ftype = v.type.value;
        interfaceTplVars.props.push({
          name: fname,
          type: ftype,
          repeated: v.repeated,
          map: v.map,
          keyType: v.map && v.keyType && v.keyType.value
        });
      }
    }
    if (nested && Object.keys(nested).length) {
      interfaceTplVars.children = parseNode(nested);
    }

    result.push(interfaceTplVars);
  }

  return result;
};

const fixType = p => {
  const { type: t, repeated, map, keyType } = p;
  let type = TypesMap[t] || t;
  if (/\w+\.\w+/.test(type)) {
    const slices = type.split('.');
    type = `${slices[0]}${slices.slice(1, slices.length).map(s => `['${s.toLowerCase()}']`).join('')}`;
  }
  if (map && keyType) {
    const kt = TypesMap[keyType] || keyType;
    type = `Record<${kt}, ${type}>`;
  }
  return repeated ? `${type}[]` : type;
};

const getChildTypesMap = (item, result = {}) => {
  if (item.children && item.children.length) {
    const parentName = item.name;
    item.children.forEach(c => {
      result[c.name] = parentName + c.name;
      getChildTypesMap(c, result);
    });
  }
  return result;
};

const flattenChildTypes = (interfaceItem, result = [], childTypesMap) => {
  if (interfaceItem.children && interfaceItem.children.length) {
    interfaceItem.children.forEach(c => {
      flattenChildTypes(c, result, childTypesMap);
    });
  }
  result.push({
    name: childTypesMap[interfaceItem.name] || interfaceItem.name,
    props: interfaceItem.props.map(p => {
      if (childTypesMap[p.type]) {
        p.type = childTypesMap[p.type];
      }
      return p;
    })
  });

  return result;
};

const parseToTs = text => {
  const ast = parse(text, { weakResolve: true });
  console.log(JSON.stringify(ast, null, '  '));
  const interfaces = parseNode(ast.root);
  const result = [];

  interfaces.forEach(item => {
    const childTypesMap = getChildTypesMap(item);
    const flattenInterfaces = flattenChildTypes(item, [], childTypesMap);
    flattenInterfaces.forEach(i => {
      const tpl = `export interface ${i.name} {
${i.props.map(p => `  ${p.name}?: ${fixType(p)};`).join('\n')}
}`;
      result.push(tpl);
    });
  });
  return result.join('\n\n');
};

module.exports = parseToTs;
