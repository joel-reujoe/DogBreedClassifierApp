import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage'
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {

  public uploadProgress=0;
  private storage:AngularFireStorage
  private toastCtrl:ToastController;


  constructor(storage: AngularFireStorage, toastCtrl: ToastController) { 
    this.storage = storage;
    this.toastCtrl = toastCtrl;

  }

  public async uploadFile(blob:Blob)
  {

    const fileName = new Date().getTime() + '.jpeg';
    const randomId = Math.random().toString(36).substring(2,8);
    const uploadTask  = this.storage.upload('files/'+fileName+'_'+randomId, blob);
    uploadTask.percentageChanges().subscribe(changes=>{
      this.uploadProgress = changes
    });
    
    uploadTask.then(async res=>{
      await res.ref.getDownloadURL().then((downloadUrl)=>{
        console.log(downloadUrl);
      });
      const toast =await this.toastCtrl.create({
        duration:2000,
        message: 'File uploaded finished'
      });
      toast.present();
    });
    
  }
}
