/**
 * SocialMock Component
 * 
 * Mock component showing nearby people who want to chat.
 * This demonstrates the "social bridge" feature without real matching.
 */

import { type Locale } from '@/lib/i18n';

interface Person {
  name: string;
  age: number;
  district: string;
  hobby: string;
}

const mockPeople: Person[] = [
  { name: '김영희', age: 72, district: '강남구', hobby: '독서' },
  { name: '박철수', age: 68, district: '서초구', hobby: '산책' },
  { name: '이순자', age: 75, district: '송파구', hobby: '요리' },
];

const mockPeopleEn: Person[] = [
  { name: 'Younghee Kim', age: 72, district: 'Gangnam', hobby: 'Reading' },
  { name: 'Chulsoo Park', age: 68, district: 'Seocho', hobby: 'Walking' },
  { name: 'Soonja Lee', age: 75, district: 'Songpa', hobby: 'Cooking' },
];

interface SocialMockProps {
  locale: Locale;
}

export function SocialMock({ locale }: SocialMockProps) {
  const people = locale === 'ko' ? mockPeople : mockPeopleEn;
  const title = locale === 'ko' ? '오늘 대화하고 싶은 분들' : 'People Looking to Chat Today';
  const connectText = locale === 'ko' ? '연결 요청' : 'Request Connection';
  const comingSoon = locale === 'ko' ? '(준비 중)' : '(Coming Soon)';

  return (
    <div className="social-mock">
      <h3 className="social-mock-title">{title}</h3>
      <div className="social-mock-list">
        {people.map((person, index) => (
          <div key={index} className="social-mock-card">
            <div className="social-mock-card-content">
              <div className="social-mock-card-header">
                <span className="social-mock-card-name">{person.name}</span>
                <span className="social-mock-card-age">{person.age}{locale === 'ko' ? '세' : ' years'}</span>
              </div>
              <div className="social-mock-card-details">
                <span className="social-mock-card-district">{person.district}</span>
                <span className="social-mock-card-hobby">{person.hobby}</span>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="social-mock-button"
              aria-label={`${connectText} - ${person.name}`}
            >
              {connectText} {comingSoon}
            </button>
          </div>
        ))}
      </div>
      <p className="social-mock-note">
        {locale === 'ko' 
          ? '곧 실제 연결 기능이 제공될 예정입니다.' 
          : 'Real connection features coming soon.'}
      </p>
    </div>
  );
}

