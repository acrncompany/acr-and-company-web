import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { ConsultationRequest, ContactPageContent, EnquiryRequest } from '../models/contact';

/** Contact page content (GET /api/public/pages/contact) and the two form submissions (POST /api/public/forms/...). */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly api = inject(ApiService);

  getContact(): Observable<ContactPageContent> {
    return this.api.get<ContactPageContent>('pages/contact');
  }

  sendEnquiry(request: EnquiryRequest): Observable<void> {
    return this.api.postForm('contact', request);
  }

  bookConsultation(request: ConsultationRequest): Observable<void> {
    return this.api.postForm('consultation', request);
  }
}
