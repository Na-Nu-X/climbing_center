import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ClimbingCourse,
  ClimbingCourseDetail,
  ClimbingZone,
  CoachMember,
  ContactPayload,
  CourseFilters,
  CourseRegistrationPayload,
  GroupEventPayload,
  PricingPass,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getZones(): Observable<ClimbingZone[]> {
    return this.http.get<ClimbingZone[]>(`${this.baseUrl}/zones/`);
  }

  getPricing(): Observable<PricingPass[]> {
    return this.http.get<PricingPass[]>(`${this.baseUrl}/pricing/`);
  }

  getCourses(filters: CourseFilters = {}): Observable<ClimbingCourse[]> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.skill_level) params = params.set('skill_level', filters.skill_level);
    if (filters.featured) params = params.set('featured', 'true');
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.ordering) params = params.set('ordering', filters.ordering);
    return this.http.get<ClimbingCourse[]>(`${this.baseUrl}/courses/`, { params });
  }

  getCourse(slug: string): Observable<ClimbingCourseDetail> {
    return this.http.get<ClimbingCourseDetail>(`${this.baseUrl}/courses/${encodeURIComponent(slug)}/`);
  }

  getTeam(): Observable<CoachMember[]> {
    return this.http.get<CoachMember[]>(`${this.baseUrl}/team/`);
  }

  createRegistration(payload: CourseRegistrationPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/registrations/`, payload);
  }

  createEventInquiry(payload: GroupEventPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/events/`, payload);
  }

  sendContactMessage(payload: ContactPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/contact/`, payload);
  }
}
