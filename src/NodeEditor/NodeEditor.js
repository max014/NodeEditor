import React, {Component} from "react";
import { NumComponent, AddComponent } from "./Editor";
import ReactRenderPlugin from "rete-react-render-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import AreaPlugin from "rete-area-plugin";
import Rete from "rete";
import {data} from './data';


class Editor extends Component {

	createEditor = async (container) => {
		var components = [new NumComponent(), new AddComponent()];
		this.editor = new Rete.NodeEditor("demo@0.1.0", container);
		this.editor.use(ConnectionPlugin);
		this.editor.use(ReactRenderPlugin);

		var engine = new Rete.Engine("demo@0.1.0");

		components.map(c => {
			this.editor.register(c);
			engine.register(c);
			return null;
		});

		await this.editor.fromJSON(data)

		this.editor.on(
		"process nodecreated noderemoved connectioncreated connectionremoved",
			async () => {
				await engine.abort();
				await engine.process(this.editor.toJSON());
			}
		);

		this.editor.view.resize();
		this.editor.trigger("process");
		AreaPlugin.zoomAt(this.editor, this.editor.nodes);
	}

	render(){
		return (
	    <div className="App">
	      <div
	        style={{ width: "100vw", height: "80vh" }}
	        ref={ref => this.createEditor(ref)}
	      />
	      <button onClick={() => console.log(this.editor.toJSON())}>data</button>
	    </div>
	  );
	}
}

export default Editor;