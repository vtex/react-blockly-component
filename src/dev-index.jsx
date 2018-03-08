/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactBlocklyComponent from './index';

const INITIAL_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
const conditionBlocks = require('../resources/blocks.json');

const CATEGORIES = [{
  name: 'Conditional Prices',
  blocks: [],
}];

function defineBlockTranslations() {
  console.log('defining blocks');
  Blockly.JavaScript.logic_if = (block) => {
    let n = 0;
    let code = '';
    
    do {
      const branchCode = Blockly.JavaScript.statementToCode(block, `DO${n}`);
      code += `(${branchCode})`;

      n += 1;
    } while (block.getInput(`IF${n}`));

    return code;
  };

  Blockly.JavaScript.logic_ifnot = (block) => {
    let n = 0;
    let code = '';
    
    do {
      const branchCode = Blockly.JavaScript.statementToCode(block, `DO${n}`);
      code += `( (${branchCode}) | not)`;

      n += 1;
    } while (block.getInput(`IF${n}`));

    return code;
  };
  Blockly.JavaScript.payment_method = (block) => {
    const dropdownCondition = block.getFieldValue('condition');
    const dropdownSubject = block.getFieldValue('subject');
    const connector = dropdownCondition === 'is' ? '==' : '!=';

    const code = `(first (.params[]? | select(.name == "paymentMethodId")) | (.value | tonumber) ${connector} ${dropdownSubject})`;
    return code;
  };

  Blockly.JavaScript.logic_and = () => {
    const code = ' and ';
    return code;
  };

  Blockly.JavaScript.logic_or = () => {
    const code = ' or ';
    return code;
  };

  Blockly.JavaScript.logic_not = () => {
    const code = ' not ';
    return code;
  };

  Blockly.JavaScript.payment_bin = (block) => {
    const dropdownCondition = block.getFieldValue('condition');
    const binMax = block.getFieldValue('bin_max');
    const binMin = block.getFieldValue('bin_min');

    const connector = dropdownCondition === 'between' ? '' : 'not ';
    console.log(binMin);

    const code = `(first (.params[]? | select(.name == "restrictionsBins")) | ${connector} ((.value | tonumber) >= ${binMin}) and (first(.params[]? | select(.name == "restrictionsBins")) | (.value | tonumber) <= ${binMax}))`;
    return code;
  };

  Blockly.JavaScript.user_utm = (block) => {
    const dropdownCondition = block.getFieldValue('condition');
    const utmType = block.getFieldValue('utm_type');
    const dropdownSubject = block.getFieldValue('subject');

    let code = '';
    if (dropdownCondition === 'is' || dropdownCondition === 'is_not') {
      const connector = dropdownCondition === 'is' ? '==' : '!=';
      code = `(.${utmType} ${connector} "${dropdownSubject}")`;
    }

    if (dropdownCondition === 'contains' || dropdownCondition === 'does_not_contain') {
      const connector = dropdownCondition === 'contains' ? '| contains(\'' : '| not (contains(\'';
      const closePar = dropdownCondition === 'contains' ? '\')' : '\'))';
      code = `(.${utmType} ${connector}${dropdownSubject}${closePar})`;
    }

    return code;
  };

  Blockly.JavaScript.user_firstbuy = (block) => {
    const dropdownCondition = block.getFieldValue('condition');
    const connector = dropdownCondition === 'is' ? '==' : '!=';

    const code = `(.isFirstBuy ${connector} true)`;
    return code;
  };
}

function createBlocks() {
  console.log(conditionBlocks);
  const types = [];
  conditionBlocks.forEach((element) => {
    const { type } = element;
    types.push(type);
    Blockly.Blocks[type] = {
      init() {
        this.jsonInit(element);
      },
    };
  });
  // Extract to another function later on
  types.forEach((element) => {
    const block = { type: element };
    console.log(block);
    CATEGORIES[0].blocks.push(block);
  });

  CATEGORIES[0].blocks.push({ type: 'controls_if' });

  defineBlockTranslations();
}

createBlocks();

class TestEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toolboxCategories: CATEGORIES,
    };
  }

  workspaceDidChange = (workspace) => {
    const newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    document.getElementById('generated-xml').innerText = newXml;

    const code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('code').value = code;
  }
  render = () => (
    <ReactBlocklyComponent.BlocklyEditor
      toolboxCategories={this.state.toolboxCategories}
      workspaceConfiguration={{
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
      }}
      initialXml={INITIAL_XML}
      wrapperDivClassName="fill-height"
      workspaceDidChange={this.workspaceDidChange}
    />
  )
}
window.addEventListener('load', () => {
  const editor = React.createElement(TestEditor);
  ReactDOM.render(editor, document.getElementById('blockly'));
});
