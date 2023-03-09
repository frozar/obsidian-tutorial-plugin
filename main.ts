import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	urlConnexion: string;
	login: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	urlConnexion:
		"https://myds.com:port/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query",
	login: "user",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("Arrete!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		// );
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
	password: string;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.password = "";
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Connexion URL")
			.setDesc("URL to your nas")
			.addText((text) =>
				text
					.setPlaceholder(this.plugin.settings.urlConnexion)
					.setValue(this.plugin.settings.urlConnexion)
					.onChange(async (value) => {
						console.log("URL: " + value);
						this.plugin.settings.urlConnexion = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Login").addText((text) =>
			text
				.setPlaceholder(this.plugin.settings.login)
				.onChange(async (value) => {
					console.log("Login: " + value);
					this.plugin.settings.login = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("Password").addText((text) =>
			text.onChange(async (value) => {
				console.log("Password: " + value);
				this.password = value;
			})
		);

		const submit = containerEl.createEl("div");
		submit
			.createEl("button", { text: "Test connexion" })
			.onClickEvent(async () => {
				console.log("click on submit");
				// TODO: check parameter of connection to the NAS
				// const res = await fetch(
				// 	"https://nas-flaxib.synology.me:5501/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query"
				// );
				const res = await fetch(
					"http://localhost:3000?url=https://nas-flaxib.synology.me:5501/webapi/entry.cgi&api=SYNO.API.Info&version=1&method=query"
				);
				console.log("res", res);
				const json = await res.json();
				console.log("json", json);
			});
	}
}
