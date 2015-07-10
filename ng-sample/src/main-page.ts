import {topmost} from 'ui/frame';
import {TextView} from 'ui/text-view';

import 'reflect-metadata';
import {Inject, Component, View, NgIf, NgFor} from 'angular2/angular2';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

import {nativeScriptBootstrap} from 'nativescript-angular/application';

var lifeCycle: LifeCycle = null;

@Component({
	selector: 'main-page',
	hostAttributes: {
	}
})
@View({
    directives: [NgIf, NgFor],
    //TODO: investigate why having a *ng-if on a non-bound element (no prop or var binding)
    //breaks the NG bootstrap. It doesn't finish, and probably swallows an exception somewhere.
    //Reproduce by removing the #more binding on the StackLayout below.
	template: `
<StackLayout orientation='vertical'>
    <Label text='Name' fontSize='32' verticalAlignment='center' padding='20'></Label>
    <TextField #name text='John' fontSize='32' padding='20'></TextField>
    <Button [text]='buttonText' (tap)='onSave($event, name.text)'></Button>
    <Button text='Toggle details' (tap)='onToggleDetails()'></Button>
    <TextView *ng-if='showDetails' [text]='detailsText'></TextView>
    <Label [text]='moreDetailsText' *ng-if='showDetails'></Label>
    <StackLayout #more *ng-if='showDetails' orientation='vertical'>
        <TextField *ng-for='#detailLine of detailLines' [text]='detailLine'></TextField>
    </StackLayout>
</StackLayout>
`,
})
class MainPage {
    public buttonText: string = "";
    public showDetails: boolean = false;
    public detailsText: string = "";
    public moreDetailsText: string = "";
    public detailLines: Array<string> = [];

    constructor() {
        this.buttonText = 'Save...'
        this.showDetails = true;
        this.detailsText = 'Some details and all...';
        this.moreDetailsText = 'More details:';

        this.detailLines = [
            "detail line 1",
            "detail line 2",
            "detail line 3",
        ];
    }

    onSave($event, name) {
        console.log('onSave event ' + $event + ' name ' + name);
        alert(name);
    }
    onToggleDetails() {
        console.log('onToggleDetails current: ' + this.showDetails);
        this.showDetails = !this.showDetails;

        //TODO: make the zone do this for us automatically.
        lifeCycle.tick();
    }
}

//TODO: move to an angular init module/base page class
export function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = "";

    console.log('BOOTSTRAPPING...');
    nativeScriptBootstrap(MainPage, []).then((appRef) => {
        console.log('ANGULAR BOOTSTRAP DONE.');
        try {
            lifeCycle = appRef.injector.get(LifeCycle);
            console.log('Got lifecycle: ' + lifeCycle);
        } catch (e) {
            console.log('Error getting lifecycle: ' + e.message + '\n' + e.stack);
        }
    }, (err) =>{
        console.log('ERROR BOOTSTRAPPING ANGULAR');
        let errorMessage = err.message + "\n\n" + err.stack;
        console.log(errorMessage);

        let view = new TextView();
        view.text = errorMessage;
        topmost().currentPage.content = view;
    });
}
