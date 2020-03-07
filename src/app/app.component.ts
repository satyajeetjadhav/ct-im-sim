import { Component, OnInit } from '@angular/core';
import { CTAction } from '../app/models/ctAction';
import { Profile } from './models/profile';
import { element } from 'protractor';
import { positionElements } from '@ng-bootstrap/ng-bootstrap/util/positioning';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ct-imSim';

  actions: CTAction[] = [];
  id: String;
  email: String;
  deviceProfile: Profile = new Profile();
  platformProfiles: Profile[] = [];
  platformProfileIndex: Map<String, number> = new Map();
  constructor() { }

  ngOnInit(): void {
    // new ctid is generated as soon as sdk is intialized
    this.deviceProfile.ctids.push(this.generateCTID());

    // this profile is uploaded to the platform
    let profile = this.clone(this.deviceProfile);
    this.platformProfiles.push(profile);

    // update the platform profile index
    this.platformProfileIndex.set(this.deviceProfile.ctids[this.deviceProfile.ctids.length - 1], this.platformProfiles.length - 1);
  }

  generateCTID() {
    return [...Array(24)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
  }

  updatePlatform(profile: Profile) {
    // update the existing profile if it already exists
    let position = this.doesProfileExist(profile);
    if (position > -1) {
      if (this.checkForIdentityErrors(profile)) {
        alert('Identity Error');
        return;
      }
      if (!this.platformProfiles[position].ids.includes(profile.ids[0])) {
        // if the id is not already present on the profile, add it to the profile
        this.platformProfiles[position].ids.push(profile.ids[0]);
        this.updateIndex(profile.ids[0], this.platformProfiles.length - 1)
      }
      if (!this.platformProfiles[position].emails.includes(profile.emails[0])) {
        // if the email is not already present on the profile, add it to the profile
        this.platformProfiles[position].emails.push(profile.emails[0]);
        this.updateIndex(profile.emails[0], this.platformProfiles.length - 1)
      }
      if (!this.platformProfiles[position].ctids.includes(profile.ctids[0])) {
        // if the email is not already present on the profile, add it to the profile
        this.platformProfiles[position].ctids.push(profile.ctids[0]);
        this.updateIndex(profile.ctids[0], this.platformProfiles.length - 1)
      }
    } else {
      // create a new profile on the platform
      let cloneProfile = this.clone(profile);
      this.platformProfiles.push(cloneProfile);
      this.updateIndex(profile.emails[0], this.platformProfiles.length - 1)
      this.updateIndex(profile.ids[0], this.platformProfiles.length - 1)
      this.updateIndex(profile.ctids[0], this.platformProfiles.length - 1)
    }

  }

  updateIndex(key: String, position: number) {
    this.platformProfileIndex.set(key, position);
  }

  shouldRefreshCTID(): Boolean {
    // is a new CTID needed
    //returns true if email and id on the device profile does not match the new email

    if (this.deviceProfile.emails.length == 0 && this.deviceProfile.ids.length == 0) {
      return false;
    }

    if (this.deviceProfile.emails.includes(this.email) ||
      this.deviceProfile.ids.includes(this.id)) {
      return false;
    }

    return true;
  }

  switchProfileOnDevice() {
    this.deviceProfile.ctids[0] = this.generateCTID();
  }

  private updateDeviceProfile() {
    this.deviceProfile.emails[0] = this.email;
    this.deviceProfile.ids[0] = this.id;
  }

  changeDevice() {
    this.deviceProfile.ctids[0] = this.generateCTID();
    this.deviceProfile.emails = [];
    this.deviceProfile.ids = [];
  }

  doesProfileExist(profile: Profile): number {
    const self = this;
    let breakFlag = false;
    let position = -1;
    for (let key in profile) {
      if (breakFlag) {
        return position;
      }
      profile[key].forEach(element => {
        if (self.platformProfileIndex.get(element) != null) {
          breakFlag = true;
          position = self.platformProfileIndex.get(element);
          return;
        }
      });
    }
    return -1;
  }

  checkForIdentityErrors(profile: Profile): Boolean {
    const self = this;
    let position = -1;
    let nMap = new Map<number, String>();
    for (let key in profile) {
      profile[key].forEach(element => {
        if (self.platformProfileIndex.get(element) != null) {
          position = self.platformProfileIndex.get(element);
          nMap.set(position, key);
        }
      });
    }
    if (nMap.size > 1) {
      return true;
    } else {
      return false;
    }
  }

  onUserLogin() {

    if (this.shouldRefreshCTID()) {
      // switch to a new profile on the device
      this.switchProfileOnDevice();
    }

    this.updateDeviceProfile();

    this.updatePlatform(this.deviceProfile);

    /*     let profile = this.platformProfiles[this.platformProfiles.length - 1]
    
        if (profile.emails.includes(this.email)) {
          //if the input email is same as profile.email - same user
          //no need to generate a ctid
          //add id to the user's profile
          if (!profile.ids.includes(this.id)) {
            // if the id is not already present on the profile, add it to the profile
            profile.ids.push(this.id);
            this.platformProfileIndex.set(this.id, this.platformProfiles.length - 1);
          }
        } else if (profile.ids.includes(this.id)) {
          //if the input id is same as profile.id - same user
          //no need to generate a ctid
          //add email to the user's profile
          if (!profile.emails.includes(this.email)) {
            // if the email is not already present on the profile, add it to the profile
            profile.emails.push(this.email);
            this.platformProfileIndex.set(this.email, this.platformProfiles.length - 1);
          }
        } else if (profile.ids.length == 0 && profile.emails.length == 0) {
          profile.ids.push(this.id);
          profile.emails.push(this.email);
        }
        else {
          // neither email nor id match
          this.createNewProfile(this.email, this.id);
        } */

  }

  profilePush() {
    this.updateDeviceProfile();
    this.updatePlatform(this.deviceProfile);
    /* let profile = this.platformProfiles[this.platformProfiles.length - 1];
    if (!profile.ids.includes(this.id)) {
      profile.ids.push(this.id);
    }
    if (!profile.emails.includes(this.email)) {
      profile.emails.push(this.email);
    } */
  }

  /* createNewProfile(email?: String, id?: String) {
    let profile = new Profile();
    profile.ctids.push(this.generateCTID());
    profile.emails.push(email);
    profile.ids.push(id);
    this.platformProfiles.push(profile);
  } */

  clone(obj) {
    if (obj == null || typeof (obj) != 'object')
      return obj;

    var temp = new obj.constructor();
    for (var key in obj)
      temp[key] = this.clone(obj[key]);

    return temp;
  }

}
