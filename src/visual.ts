/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumMemberValue = powerbi.EnumMemberValue;

import { VisualFormattingSettingsModel, Weekday } from "./settings";



export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private autoFlagsNode: Text;
    private itemFlagsNode: Text;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.updateCount = 0;
        if (document) {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Auto flags:"));
            const new_em: HTMLElement = document.createElement("em");
            this.autoFlagsNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.autoFlagsNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);

            const new_p2: HTMLElement = document.createElement("p");
            new_p2.appendChild(document.createTextNode("Item flags:"));
            const new_em2: HTMLElement = document.createElement("em");
            this.itemFlagsNode = document.createTextNode(this.updateCount.toString());
            new_em2.appendChild(this.itemFlagsNode);
            new_p2.appendChild(new_em2);
            this.target.appendChild(new_p2);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

        const autoFlagsValue: EnumMemberValue = this.formattingSettings.dataPointCard.autoFlags.value;
        const autoFlagsNumber: number = Number(autoFlagsValue.valueOf());
        const autoFlags: Weekday = this.isWeekday(autoFlagsNumber) ? autoFlagsNumber : Weekday.Sunday;

        // invalid typescript type, you need to use itemFlags.value.value
        const itemFlagsValue: number = (this.formattingSettings.dataPointCard.itemFlags.value as any).value;
        const itemFlgas: Weekday = this.isWeekday(itemFlagsValue) ? itemFlagsValue : Weekday.Sunday;

        if (this.autoFlagsNode) {
            this.autoFlagsNode.textContent = autoFlags.toString(2).padStart(7, "0");
        }
        if (this.itemFlagsNode) {
            this.itemFlagsNode.textContent = itemFlgas.toString(2).padStart(7, "0");
        }
    }

    private isWeekday(value: number): value is Weekday {
        const allFlags = Object.values(Weekday).filter((v) => typeof v === "number").reduce((acc, v: number) => acc | v, 0);
        return (allFlags && value) === value;
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}