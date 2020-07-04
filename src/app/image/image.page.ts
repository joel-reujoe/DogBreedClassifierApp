import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { Resolve, ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';



@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit {

  data:any;
  constructor(private route: ActivatedRoute, public photoService: PhotoService, private platform: Platform, private router: Router) { 
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/tabs/tab2']);
    });
  }

  async ngOnInit() {
    if(this.route.snapshot.data['value'])
    {
      this.data = await this.photoService.getPhoto(this.route.snapshot.data['value']);
    }
  }

}
