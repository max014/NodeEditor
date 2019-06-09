import React from "react";
import Rete from "rete";
import { MyNode } from "./MyNode";

var numSocket = new Rete.Socket("Number value");

class NumControl extends Rete.Control {
  static component = ({ value, onChange }) => (
    <input
      type="number"
      value={value}
      onChange={e => onChange(+e.target.value)}
      onPointerMove={e => e.stopPropagation()}
    />
  );

  constructor(emitter, key, node, readonly = false) {
    super(key);
    this.emitter = emitter;
    this.key = key;
    this.component = NumControl.component;

    const initial = node.data[key] || 0;

    node.data[key] = initial;
    this.props = {
      readonly,
      value: initial,
      onChange: v => {
        this.setValue(v);
        this.emitter.trigger("process");
      }
    };
  }

  setValue(val) {
    this.props.value = val;
    this.putData(this.key, val);
    this.update();
  }
}

export class NumComponent extends Rete.Component {
  constructor() {
    super("Number");
  }

  builder(node) {
    var out1 = new Rete.Output("num", "Number", numSocket);
    var ctrl = new NumControl(this.editor, "num", node);

    return node.addControl(ctrl).addOutput(out1);
  }

  worker(node, inputs, outputs) {
    outputs["num"] = node.data.num;
  }
}

export class AddComponent extends Rete.Component {
  constructor() {
    super("Add");
    this.data.component = MyNode;
  }

  builder(node) {
    var inp1 = new Rete.Input("num1", "Number", numSocket);
    var inp2 = new Rete.Input("num2", "Number2", numSocket);
    var inp3 = new Rete.Input("num3", "Number3", numSocket);
    var out = new Rete.Output("num", "Number", numSocket);

    inp1.addControl(new NumControl(this.editor, "num1", node));
    inp2.addControl(new NumControl(this.editor, "num2", node));
    inp3.addControl(new NumControl(this.editor, "num3", node));

    return node
      .addInput(inp1)
      .addInput(inp2)
      .addInput(inp3)
      .addControl(new NumControl(this.editor, "preview", node, true))
      .addOutput(out);
  }

  worker(node, inputs, outputs) {
    var n1 = inputs["num1"].length ? inputs["num1"][0] : node.data.num1;
    var n2 = inputs["num2"].length ? inputs["num2"][0] : node.data.num2;
    var n3 = inputs["num3"].length ? inputs["num3"][0] : node.data.num3;
    var sum = n1 + n2 + n3;

    this.editor.nodes
      .find(n => n.id === node.id)
      .controls.get("preview")
      .setValue(sum);
    outputs["num"] = sum;
  }
}
