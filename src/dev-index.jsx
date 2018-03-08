/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactBlocklyComponent from './index';

const INITIAL_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
const paymentBlocks = require('../resources/payment.json');
const userBlocks = require('../resources/user.json');
const operatorBlocks = require('../resources/operator.json');

const CATEGORIES = [{
  name: 'Payment',
  blocks: [],
},
{
  name: 'user context',
  blocks: [],
},
{
  name: 'operators',
  blocks: [],
}];

function createBlocks() {
  // Adding Payment blocks
  let types = [];
  paymentBlocks.forEach((element) => {
    const { type } = element;
    types.push(type);
    Blockly.Blocks[type] = {
      init() {
        this.jsonInit(element);
      },
    };
  });

  types.forEach((element) => {
    const block = { type: element };
    CATEGORIES[0].blocks.push(block);
  });

  types = [];
  userBlocks.forEach((element) => {
    const { type } = element;
    types.push(type);
    Blockly.Blocks[type] = {
      init() {
        this.jsonInit(element);
      },
    };
  });

  types.forEach((element) => {
    const block = { type: element };
    CATEGORIES[1].blocks.push(block);
  });

  types = [];
  operatorBlocks.forEach((element) => {
    const { type } = element;
    types.push(type);
    Blockly.Blocks[type] = {
      init() {
        this.jsonInit(element);
      },
    };
  });

  types.forEach((element) => {
    const block = { type: element };
    CATEGORIES[2].blocks.push(block);
  });
}

createBlocks();

class TestEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toolboxCategories: CATEGORIES,
    };
  }

  defineBlockTranslations = () => {
    Blockly.JavaScript.payment_method = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const dropdownSubject = block.getFieldValue('subject');
      const connector = dropdownCondition === 'is' ? '==' : '!=';

      const code = `(first (.params[]? | select(.name == "paymentMethodId")) | (.value | tonumber) ${connector} ${dropdownSubject})`;
      return code;
    };

    Blockly.JavaScript.payment_bin_interval = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const binMax = block.getFieldValue('bin_max');
      const binMin = block.getFieldValue('bin_min');

      const firstConnector = dropdownCondition === 'between' ? '' : '(';
      const secondConnector = dropdownCondition === 'between' ? '' : ' | not )';
      const code = `${firstConnector}(first (.params[]? | select(.name == "restrictionsBins")) | (.value | tonumber) >= ${binMin}) and (first(.params[]? | select(.name == "restrictionsBins")) | (.value | tonumber) <= ${binMax})${secondConnector}`;
      return code;
    };

    Blockly.JavaScript.payment_bin = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const binNumber = block.getFieldValue('bin_number');

      const connector = dropdownCondition === 'is' ? '==' : '!=';

      const code = `(first (.params[]? | select(.name=="restrictionsBins")) | (.value | tonumber) ${connector} ${binNumber})`;
      return code;
    };

    Blockly.JavaScript.installments = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const installmentsNumber = block.getFieldValue('installments_number');

      const connector = dropdownCondition === 'greater' ? '>=' : '<=';

      const code = `(first (.params[]? | select(.name=="installments")) | (.value | tonumber) ${connector} ${installmentsNumber})`;
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
        const connector = dropdownCondition === 'contains' ? '| contains("' : '| (contains("';
        const closePar = dropdownCondition === 'contains' ? '")' : '") | not)';
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
  workspaceDidChange = (workspace) => {
    const newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    document.getElementById('generated-xml').innerText = newXml;

    this.defineBlockTranslations();

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
