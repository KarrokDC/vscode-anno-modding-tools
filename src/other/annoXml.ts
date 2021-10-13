import * as fs from 'fs';
import * as xmldoc from 'xmldoc';

type INodeMap = { [index: string]: xmldoc.XmlElement };

// lazy implementation of what I needed
// this needs some clean up and tests!

class XPathCondition {
  readonly tag: string;
  readonly value: string;
  public constructor(condition: string) {
    const split = condition.split('=');
    this.tag = split[0].trim();
    if (split.length > 0) {
      const value = split[1].trim();
      if (value.startsWith('\'') && value.endsWith('\'')) {
        this.value = value.substr(1, value.length - 2);
      }
      else {
        this.value = value;
      }
    }
    else {
      this.value = '';
    }
  }

  public toString() {
    return `${this.tag}='${this.value}'`;
  }
}

class XPathNode {
  readonly tag: string;
  readonly conditions: XPathCondition[];
  public constructor(path: string) {
    const match = path.match(/^([^\[\]\/]+)(\[[^\[\]]+\])?$/);
    this.tag = match ? match[1] : path;
    if (match && match[2]) {
      // support only ' and ' and ignore the rest
      const split = (match[2].substr(1, match[2].length - 2)).split(' and ');
      this.conditions = split.map((e) => new XPathCondition(e.trim()));
    }
    else {
      this.conditions = [];
    }
  }

  public toString() {
    if (this.conditions.length > 0) {
      return this.tag + '[' + this.conditions.join(' and ') + ']';
    }
    return this.tag;
  }
}

class XPath {
  // simplistic implementation of xpath
  readonly path: string;
  readonly nodes: XPathNode[];
  public constructor(path: string) {
    this.path = path;
    this.nodes = path.split('/').map((e) => new XPathNode(e));
  }
}

export default class AnnoXml {
  private xml: xmldoc.XmlDocument;
  private nodes: INodeMap;

  public static fromFile(filePath: string) {
    const xml = new xmldoc.XmlDocument(fs.readFileSync(filePath, 'utf8').toString());

    const nodes: INodeMap = {};
    AnnoXml._scanNodes(xml, nodes);
    return new AnnoXml(xml, nodes);
  }

  public setValue(nodeName: string, values: any, options?: { insert: string, defaults: any }) {
    const optionsInsert = options?.insert;
    let node = this.nodes[nodeName];
    let newNode = false;
    
    if (!node && optionsInsert) {
      const parent = this._firstNode(optionsInsert);
      if (parent) {
        node = this._createXmlElement(parent, 'Config');
        newNode = true;
      }
      else {
        console.log('no parent found: ' + optionsInsert);
        // TODO create parent if not there?
      }
    }
    
    if (!node) {
      return;
    }

    // only apply defaults for new nodes
    let insertValues = { ...(newNode&&options?.defaults||{}), ...values };
    this._setValue(node, insertValues);
  }

  public setArray(path: string, name: string, values: any[]) {
    const parent = this._firstNode(path);
    if (parent) {
      // clear out parent
      parent.children = [];
      parent.firstChild = null;
      parent.lastChild = null;
      // refill
      for (let value of values) {
        const node = this._createXmlElement(parent, name);
        this._setValue(node, value);
      }
    }
    else {
      console.warn(`${path} not found`);
    }
  }

  public set(xpath: string, values: any) {
    const node = this._getNode(xpath);
    if (!node) {
      // TODO create?
      return;
    }

    this._setValue(node, values);
  }

  public toString(): string {
    return this.xml.toString({ compressed: true, preserveWhitespace: true, html: true });
  }

  public getPropNames() {
    return Object.keys(this.nodes).filter((e) => e.startsWith('prop_'));
  }

  public ensureSection(path: string, inserts: (any)[]) {
    const pathElements = path.split('.');
    let node: xmldoc.XmlElement | undefined = this.xml;
    for (let i = 0; i < pathElements.length && node; i++) {
      const parent = node;
      node = node.childNamed(pathElements[i] as string);
      if (!node) {
        // create
        let insert = inserts[i]?.position;
        if (insert) {
          const position = insert.split(':')[1];
          insert = insert.split(':')[0];
          if (position === 'after') {
            // after tag with name of insert
            let insertAfterThis = parent.childNamed(insert);
            if (insertAfterThis) {
              node = this._insertAfterXmlElement(parent, insertAfterThis, pathElements[i]);
            }
            else {
              console.warn('element not found ' + insert);
            }
          }
          else {
            console.warn('unknown position ' + position);
          }
        }
        else {
          // just as last child
          node = this._setXmlElementVal(parent, pathElements[i], '');
        }

        if (node && inserts[i]?.defaults) {
          this._setValue(node, inserts[i].defaults);
        }
      }
    }
    return node;
  }

  private constructor(xml: xmldoc.XmlDocument, nodes: INodeMap) {
    this.xml = xml;
    this.nodes = nodes;
  }

  private static _scanNodes(node: xmldoc.XmlElement, nodes: INodeMap) {
    if (node.type !== 'element') {
      return;
    }

    const nodeName = node.childNamed('Name');
    if (nodeName && nodeName.val.toString().trim()) {
      // TODO name collision warning
      nodes[nodeName.val] = node;
    }

    for (let child of node.children) {
      if (child.type === 'element') {
        this._scanNodes(child as xmldoc.XmlElement, nodes);
      }
    }
  }

  private _firstNode(path: string, create?: string) {
    const pathElements = path.split('.');
    let node: xmldoc.XmlElement | undefined = this.xml;
    while (pathElements.length > 0 && node) {
      node = node.childNamed(pathElements.shift() as string);
    }
    return node;
  }

  private _getNode(path: string) {
    const xpath = new XPath(path).nodes;
    let history = '/Config';
    xpath.shift(); // skip /
    xpath.shift(); // skip Config

    let node: xmldoc.XmlElement | undefined = this.xml;
    while (xpath.length > 0 && node) {
      let xpathNode = xpath.shift() as XPathNode;
      history += '/' + xpathNode.toString();
      const children = node.childrenNamed(xpathNode.tag);

      if (children.length === 0) {
        break;
      }
      else if (xpathNode.conditions === undefined) {
        node = children[0];
      }
      else {
        node = undefined;
        for (let child of children) {
          let conditionsMet = true;
          for (let condition of xpathNode.conditions) {
            if ((child.childNamed(condition.tag)?.firstChild as xmldoc.XmlTextNode)?.text !== condition.value) {
              conditionsMet = false;
              break;
            }
          }
          if (conditionsMet) {
            node = child;
            break;
          }
        }
      }
    }
    if (!node) {
      console.warn(`cannot find element ${history}`);
    }
    return node;
  }

  private _createXmlElement(parent: xmldoc.XmlElement, tag: string, value?: string): xmldoc.XmlElement {
    // TODO now this is hacky, I definitely need to just directly use sax instead of xmldoc
    const template = new xmldoc.XmlDocument(`<xml> <${tag}>${value||''}</${tag}>\n</xml>`);
    const indentation = template.children[0] as xmldoc.XmlTextNode;
    const node = template.children[1] as xmldoc.XmlElement;
    const linebreak = template.children[2] as xmldoc.XmlTextNode;

    // parent.column is where the tag ends, a bit odd...
    const column = parent.column - (parent.position - parent.startTagPosition + 1);

    indentation.text = '  ';
    linebreak.text = linebreak.text + ' '.repeat(column);
    if (parent.children.length <= 1) {
      // start with line break
      indentation.text = '\n' + ' '.repeat(column + 2);
      linebreak.text = '\n' + ' '.repeat(column);
    }
    node.column = column + tag.length + 2;
    node.position = tag.length;
    node.startTagPosition = 1;

    parent.children.push(indentation);
    parent.children.push(node);
    parent.children.push(linebreak);
    parent.firstChild = parent.children[0];
    parent.lastChild = parent.children[parent.children.length - 1];
    return node;
  }

  private _insertAfterXmlElement(parent: xmldoc.XmlElement, relative: xmldoc.XmlElement, tag: string) {
    const template = new xmldoc.XmlDocument(`<xml><${tag}></${tag}>\n</xml>`);
    const node = template.children[0] as xmldoc.XmlElement;
    const linebreak = template.children[1] as xmldoc.XmlTextNode;

    const column = parent.column - (parent.position - parent.startTagPosition + 1);

    const position = parent.children.indexOf(relative);
    if (position >= 0) {
      linebreak.text = (parent.children[position + 1] as xmldoc.XmlTextNode)?.text || '\n';
      node.column = column + tag.length + 2;
      node.position = tag.length;
      node.startTagPosition = 1;
      parent.children.splice(position + 2, 0, node, linebreak);
      parent.firstChild = parent.children[0];
      parent.lastChild = parent.children[parent.children.length - 1];
    }

    return node;
  }

  private _setXmlElementVal(node: xmldoc.XmlElement, key: string, value: string) {
    const property = node.childNamed(key);
    if (!property) {
      return this._createXmlElement(node, key, value);
    }
    else {
      (property.firstChild as xmldoc.XmlTextNode).text = value;
      return property;
    }
  }

  public _setValue(node: xmldoc.XmlElement, values: any) {
    const coord = [ 'x', 'y', 'z', 'w'];

    for (let key of Object.keys(values)) {
      const value = values[key];
      if (Array.isArray(value)) {
        const numbers = value as number[];
        for (let i = 0; i < Math.min(4, numbers.length); i++) {
          this._setXmlElementVal(node, key + '.' + coord[i], numbers[i].toFixed(6).toString());
        }
      }
      else if (value !== undefined) {
        this._setXmlElementVal(node, key, value.toString());
      }
      else {
        // skip undefined values
      }
    }
  }
}
