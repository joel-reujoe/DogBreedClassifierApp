import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { FirebaseServicesService} from '../services/firebase-services.service';
import { Router } from '@angular/router';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private router: Router, public photoService: PhotoService, public firebaseService:FirebaseServicesService) { }

  ngOnInit() {
    this.photoService.loadSaved();
  }

  goToPhoto(position){
    this.router.navigate(['/image/'+position]);
  }

}
