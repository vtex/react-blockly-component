/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactBlocklyComponent from './index';
const INITIAL_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="text" x="70" y="30"><field name="TEXT"></field></block></xml>';
var mathChangeJson = {
  "type": "payment_method",
  "message0": "Payment method %1 %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "condition",
      "options": [
        [
          "is",
          "is"
        ],
        [
          "is not",
          "is_not"
        ],
        [
          "",
          ""
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "subject",
      "options": [
        [
          "American Express (1)",
          "1"
        ],
        [
          "Diners (2)",
          "2"
        ],
        [
          "Visa (3)",
          "3"
        ],
        [
          "Mastercard (4)",
          "4"
        ],
        [
          "Boleto (6)",
          "6"
        ],
        [
          "Tarjeta Cencosud (501)",
          "501"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "previousStatement": "logic_type",
  "nextStatement": "Boolean",
  "colour": 230,
  "tooltip": "Will evaluate to true if the user is buying with the desired payment method",
  "helpUrl": ""
};
const CATEGORIES = [{
  name: 'Test',
  blocks: [{type: 'test'}]
}];
function createBlocks() {
  var conditionBlocks = require('../resources/blocks.json');
  console.log(conditionBlocks);
  var types = [];
  conditionBlocks.forEach(element => {
    var type = element['type'];
    types.push(type);
    Blockly.Blocks[type] = {
      init: function() {
        this.jsonInit(element);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function() {
          // return 'Add a number to variable "%1".'.replace('%1',
          //     thisBlock.getFieldValue('VAR'));
        });
      }
    };   
  });
  //Extract to another function later on
  types.forEach(element => {
      var block = {type: element};
      CATEGORIES[0]['blocks'].push(block);
  });
} 
createBlocks();
const INITIAL_TOOLBOX_CATEGORIES = [
  {
    name: 'Controls',
    blocks: [
      { type: 'math_change'},
      { type: 'controls_if' },
      {
        type: 'controls_repeat_ext',
        values: {
          TIMES: {
            type: 'math_number',
            shadow: true,
            fields: {
              NUM: 10,
            },
          },
        },
        statements: {
          DO: {
            type: 'text_print',
            shadow: true,
            values: {
              TEXT: {
                type: 'text',
                shadow: true,
                fields: {
                  TEXT: 'abc',
                },
              },
            },
          },
        },
      },
    ],
  },
  {
    name: 'Text',
    blocks: [
      { type: 'text' },
      {
        type: 'text_print',
        values: {
          TEXT: {
            type: 'text',
            shadow: true,
            fields: {
              TEXT: 'abc',
            },
          },
        },
      },
    ],
  },
];
class TestEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toolboxCategories: CATEGORIES,
    };
  }
  componentDidMount = () => {
    window.setTimeout(() => {
      this.setState({
        toolboxCategories: this.state.toolboxCategories.concat([
          {
            name: 'Text2',
            blocks: [
              { type: 'text' },
              {
                type: 'text_print',
                values: {
                  TEXT: {
                    type: 'text',
                    shadow: true,
                    fields: {
                      TEXT: 'abc',
                    },
                  },
                },
              },
            ],
          },
        ]),
      });
    }, 2000);
  }

  defineBlockTranslations = () => {
    console.log('defining blocks');
    Blockly.JavaScript.payment_method = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const dropdownSubject = block.getFieldValue('subject');
      const connector = dropdownCondition == 'is' ? '==' : '!=';

      const code = `(first (.params[]? | select(.name == "paymentMethodId")) | (.value | tonumber) ${connector} ${dropdownSubject})`;
      return code;
    };

    Blockly.JavaScript.logic_and = (block) => {
      const code = ` and `;
      return code;
    };
    
    Blockly.JavaScript.logic_or = (block) => {
      const code = ` or `;
      return code;
    };

    Blockly.JavaScript.logic_not = (block) => {
      const code = ` not `;
      return code;
    };

    Blockly.JavaScript.payment_bin = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const bin_max = block.getFieldValue('bin_max');
      const bin_min = block.getFieldValue('bin_min');

      const connector = dropdownCondition == 'between' ? '' : 'not ';
      console.log(bin_min)
      
      const code = `(first (.params[]? | select(.name == "restrictionsBins")) | ${connector} ((.value | tonumber) >= ${bin_min}) and (first(.params[]? | select(.name == "restrictionsBins")) | (.value | tonumber) <= ${bin_max}))`;
      return code;
    };

    Blockly.JavaScript.user_utm = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const utm_type = block.getFieldValue('utm_type')
      const dropdownSubject = block.getFieldValue('subject')

      var code = '';
      if (dropdownCondition == 'is' || dropdownCondition == 'is_not') {
        const connector = dropdownCondition == 'is' ? '==' : '!=';
        code = `(.${utm_type} ${connector} "${dropdownSubject}")`;
      }
      if (dropdownCondition == 'contains' || dropdownCondition == 'does_not_contain') {
        const connector = dropdownCondition == 'contains' ? `| contains('` : `| not (contains('`;
        const closePar = dropdownCondition == 'contains' ? `')` : `'))`;
        code = `(.${utm_type} ${connector}${dropdownSubject}${closePar})`
      } 
      return code;
    };    

    Blockly.JavaScript.user_firstbuy = (block) => {
      const dropdownCondition = block.getFieldValue('condition');
      const connector = dropdownCondition == 'is' ? '==' : '!=';
      
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