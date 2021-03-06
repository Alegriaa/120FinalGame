class EndingScene extends Phaser.Scene {

    /*
Important notes:
    -For this scene specifically, it is vital that every dialogue option has a choice parameter which is set to true
    or false depending on the individual option



    Credits:
    Nathan Altice Github Dialog project ***insert

    */
    constructor() {


        super("endingScene");

        // dialog box x-position
        this.DBOX_X = 0;
        // dialog box y-position		   
        this.DBOX_Y = 400;
        // dialog box font key	    
        this.DBOX_FONT = 'gem_font';

        this.TEXT_X = 50;			// text w/in dialog box x-position
        this.TEXT_Y = 445;			// text w/in dialog box y-position
        this.TEXT_SIZE = 24;		// text font size (in pixels)
        this.TEXT_MAX_WIDTH = 715;	// max width of text within box

        this.NEXT_TEXT = '[SPACE]';	// text to display for next prompt
        this.NEXT_X = 775;			// next text prompt x-position
        this.NEXT_Y = 574;			// next text prompt y-position

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen

        // dialog variables
        this.dialogConvo = 0;			// current "conversation"
        this.dialogLine = 0;			// current line of conversation
        this.dialogSpeaker = null;		// current speaker
        this.dialogLastSpeaker = null;	// last speaker
        this.dialogTyping = false;		// flag to lock player input while text is "typing"
        this.dialogText = null;			// the actual dialog text
        this.nextText = null;			// player prompt text to continue typing

        // character variables
        this.you = null;
        this.minerva = null;
        this.neptune = null;
        this.jove = null;
        this.tweenDuration = 500;

        this.OFFSCREEN_X = -500;        // x,y values to place characters offscreen
        this.OFFSCREEN_Y = 1000;

        this.firstPointerVar = 0;
        this.secondPointerVar = 0;
        this.currentDialogSpeaker = '';

    }

    preload() {

        // getting these ready for the world scene
        this.load.json('dialog', './assets/JSON/dialogue.json');
        this.load.bitmapFont('gem_font', './assets/gem.png', './assets/gem.xml');
        this.load.image('dialogbox', './assets/dialogbox.png');

        this.load.image('shadow', './assets/ShadowLeftSmallSprite.png');
        this.load.image('self', './assets/PlayerCharacterRight.png');

        this.load.image('Meditation', './assets/Meditation.png');
    }

    create() {

        //setting up keys D and A for navigation
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        //scene background
        this.background = this.add.tileSprite(960, 640, 1930, 1300, 'Meditation');


        //character models
        this.shadowSelf = this.physics.add.sprite(centerX + 250, centerY - 50, 'shadow').setScale(2);
        this.shadowSelf = this.physics.add.sprite(centerX - 250, centerY - 50, 'self').setScale(2);


        //import the dialogue file
        this.dialog = this.cache.json.get('dialogue');
        console.log(this.dialog);


        this.dialogChoice = false;


        // parse dialog from JSON file
        this.dialog = this.cache.json.get('dialog');
        //console.log(this.dialog);

        // add dialog box sprite
        this.dialogbox = this.add.sprite(this.DBOX_X + 75, this.DBOX_Y, 'dialogbox').setOrigin(0);

        // initialize dialog text objects (with no text)
        this.dialogText = this.add.bitmapText(this.TEXT_X + 75, this.TEXT_Y, this.DBOX_FONT, '', this.TEXT_SIZE);
        this.nextText = this.add.bitmapText(this.NEXT_X + 75, this.NEXT_Y, this.DBOX_FONT, '', this.TEXT_SIZE);

        // ready the character dialog images offscreen
        this.you = this.add.sprite(this.OFFSCREEN_X, this.DBOX_Y + 8, 'player').setOrigin(0, 1);
        this.monster = this.add.sprite(this.OFFSCREEN_X, this.DBOX_Y + 8, 'monsterSketch').setOrigin(0, 1);
        this.neptune = this.add.sprite(this.OFFSCREEN_X, this.DBOX_Y + 8, 'neptune').setOrigin(0, 1);
        // this.jove = this.add.sprite(this.OFFSCREEN_X, this.DBOX_Y+8, 'jove').setOrigin(0, 1);

        // input
        cursors = this.input.keyboard.createCursorKeys();

        // start dialogue
        this.typeText();
    }

    update() {
        // check for spacebar press
        if (Phaser.Input.Keyboard.JustDown(cursors.space) && !this.dialogTyping && !this.dialogChoice) {
            // trigger dialog
            this.typeText();
        }

        if (this.dialogChoice && Phaser.Input.Keyboard.JustDown(keyD)) {

            this.scene.start('creditScene');
        }




    }

    typeText() {
        // lock input while typing
        this.dialogTyping = true;

        // clear text
        this.dialogText.text = '';
        this.nextText.text = '';

        /* Note: In my conversation data structure: 
                - each array within the main JSON array is a "conversation"
                - each object within a "conversation" is a "line"
                - each "line" can have 3 properties: 
                    1. a speaker
                    2. the dialog text
                    3. an (optional) flag indicating if this speaker is new
        */

        // make sure there are lines left to read in this convo, otherwise jump to next convo
        if (this.dialogLine > this.dialog[this.dialogConvo].length - 1) {
            this.dialogLine = 0;
            // I increment conversations here, but you could create logic to exit the dialog here
            //this.dialogConvo++;
        }

        // make sure we haven't run out of conversations...
        if (this.dialogConvo >= this.dialog.length) {
            // here I'm simply "exiting" the last speaker and removing the dialog box,
            // but you could build other logic to change game states here
            console.log('End of Conversations');
            // tween out prior speaker's image

            // make text box invisible
            this.dialogbox.visible = false;

        } else {
            // if not, set current speaker
            this.dialogSpeaker = this.dialog[this.dialogConvo][this.dialogLine]['speaker'];

            this.choice = this.dialog[this.dialogConvo][this.dialogLine]['choice'];
            this.firstPointerVar = this.dialog[this.dialogConvo][this.dialogLine]['firstPointer'];
            this.secondPointerVar = this.dialog[this.dialogConvo][this.dialogLine]['secondPointer'];
            if (this.choice == 'false') {
                this.dialogChoice = false;
            } else {
                this.dialogChoice = true;

            }



            // build dialog (concatenate speaker + line of text)
            this.dialogLines = this.dialog[this.dialogConvo][this.dialogLine]['speaker'].toUpperCase() + ': ' + this.dialog[this.dialogConvo][this.dialogLine]['dialog'];

            // create a timer to iterate through each letter in the dialog text
            let currentChar = 0;
            this.textTimer = this.time.addEvent({
                delay: this.LETTER_TIMER,
                repeat: this.dialogLines.length - 1,
                callback: () => {
                    // concatenate next letter from dialogLines
                    this.dialogText.text += this.dialogLines[currentChar];
                    // advance character position
                    currentChar++;
                    // check if timer has exhausted its repeats 
                    // (necessary since Phaser 3 no longer seems to have an onComplete event)
                    if (this.textTimer.getRepeatCount() == 0) {
                        // show prompt for more text
                        this.nextText = this.add.bitmapText(this.NEXT_X, this.NEXT_Y, this.DBOX_FONT, this.NEXT_TEXT, this.TEXT_SIZE).setOrigin(1);
                        // un-lock input
                        this.dialogTyping = false;
                        // destroy timer
                        this.textTimer.destroy();
                    }
                },
                callbackScope: this // keep Scene context
            });

            // set bounds on dialog
            this.dialogText.maxWidth = this.TEXT_MAX_WIDTH;

            // increment dialog line
            this.dialogLine++;

            // set past speaker
            this.dialogLastSpeaker = this.dialogSpeaker;

        }
    }
}