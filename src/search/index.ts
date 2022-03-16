import { Document } from "flexsearch";
export const index = new Document({
	document: {
		id: "meta:id",
		index: [
			"content[]:firstHeader",
			"content[]:firstHeader:children[]:secondHeader",
			"content[]:firstHeader:children[]:content",
		],
	},
	worker: true,
});
const document = {
	meta: { id: "testId" },
	content: [
		{
			firstHeader: "firHeader1",
			children: [
				{ secondHeader: "secondHeader11", content: "11content" },
				{ secondHeader: "secondHeader12", content: "12content" },
			],
		},
		{
			firstHeader: "firHeader2",
			children: [{ secondHeader: "secondHeader21", content: "21content" }],
		},
		{
			firstHeader: "firHeader3",
			children: [{ secondHeader: "secondHeader31", content: "31content" }],
		},
		{
			firstHeader: "firHeader4",
			children: [{ secondHeader: "secondHeader41", content: "41content" }],
		},
	],
};
index.add(document);