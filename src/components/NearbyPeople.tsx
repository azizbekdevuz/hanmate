/**
 * NearbyPeople Component
 * 
 * Mock social section showing people who want to chat.
 * This demonstrates the social connection feature for the hackathon demo.
 */

export function NearbyPeople() {
  const people = [
    {
      name: '김순자',
      age: 74,
      area: '광진구',
      interest: '성당 친구',
    },
    {
      name: '박영호',
      age: 71,
      area: '성동구',
      interest: '아침 산책',
    },
    {
      name: '이미영',
      age: 73,
      area: '송파구',
      interest: '독서 모임',
    },
  ];

  return (
    <div className="w-full mt-8 pt-8 border-t border-gray-200">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 text-center sm:text-left">
        오늘 대화하고 싶은 분들
      </h3>
      
      <div className="space-y-4">
        {people.map((person, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-semibold text-gray-900">
                  {person.name} 님
                </span>
                <span className="text-base sm:text-lg text-gray-600">
                  {person.age}세
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600">
                <span>{person.area}</span>
                <span>·</span>
                <span>{person.interest}</span>
              </div>
            </div>
            
            <button
              type="button"
              disabled
              className="px-5 py-2.5 bg-gray-100 text-gray-500 border border-gray-300 rounded-lg text-sm font-medium cursor-not-allowed opacity-60 whitespace-nowrap transition-opacity"
              aria-label={`${person.name}님과 연결 요청 (준비 중)`}
            >
              곧 제공
            </button>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 text-center mt-6 italic">
        곧 실제 연결 기능이 제공될 예정입니다.
      </p>
    </div>
  );
}

