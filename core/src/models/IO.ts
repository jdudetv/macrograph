import { Node } from "./Node";
import { createMutable } from "solid-js/store";
import { AnyType } from "../types";
import { Connection } from "../bindings/Connection";

export type DataInputArgs = {
  variant: "Data";
  id: string;
  name?: string;
  type: AnyType;
  defaultValue?: any;
  connection?: Connection | null;
  node: Node;
};

export class DataInput {
  id: string;
  name?: string;
  defaultValue: any;
  type: AnyType;
  node: Node;
  connection: DataOutput | null = null;

  constructor(args: DataInputArgs) {
    this.id = args.id;
    this.name = args.name;
    this.defaultValue = args.defaultValue || args.type.default();
    this.node = args.node;
    this.type = args.type;

    createMutable(this);
  }

  async disconnect(_send = true) {
    this.connection?.connections.splice(
      this.connection.connections.indexOf(this),
      1
    );
    this.connection = null;
  }

  setDefaultValue(value: any) {
    this.defaultValue = value;

    this.node.graph.save();
  }

  get connected() {
    return this.connection !== null;
  }

  get variant() {
    return "data" as const;
  }
}

export interface DataOutputArgs {
  node: Node;
  id: string;
  name?: string;
  type: AnyType;
}

export class DataOutput {
  id: string;
  connections: DataInput[] = [];
  node: Node;
  name?: string;
  type: AnyType;

  constructor(args: DataOutputArgs) {
    this.id = args.id;
    this.node = args.node;
    this.name = args.name;
    this.type = args.type;

    return createMutable(this);
  }

  async disconnect() {
    this.connections.forEach((c) => (c.connection = null));
    this.connections = [];
  }

  get connected() {
    return this.connections.length > 0;
  }

  get variant() {
    return "data";
  }
}

export interface ExecInputArgs {
  node: Node;
  variant: "Exec";
  id: string;
  name?: string;
  connection?: Connection | null;
}

export class ExecInput {
  id: string;
  connection: ExecOutput | null = null;
  public node: Node;
  public name?: string;

  constructor(args: ExecInputArgs) {
    this.id = args.id;
    this.node = args.node;
    this.name = args.name;

    createMutable(this);
  }

  async disconnect(_send = true) {
    if (this.connection) this.connection.connection = null;
    this.connection = null;
  }

  get connected() {
    return this.connection !== null;
  }

  get variant() {
    return "exec";
  }
}

export interface ExecOutputArgs {
  node: Node;
  id: string;
  name?: string;
}

export class ExecOutput {
  id: string;
  connection: ExecInput | null = null;
  public node: Node;
  public name?: string;

  constructor(args: ExecOutputArgs) {
    this.id = args.id;
    this.node = args.node;
    this.name = args.name;

    createMutable(this);
  }

  async disconnect(_send = true) {
    if (this.connection) this.connection.connection = null;
    this.connection = null;
  }

  get connected() {
    return this.connection !== null;
  }

  get variant() {
    return "exec";
  }
}

export type ExecPin = ExecInput | ExecOutput;
export type DataPin = DataInput | DataOutput;
export type Pin = ExecPin | DataPin;
