export enum GoalType {
  Gain = 'gain',
  Lose = 'lose',
  Maintain = 'maintain',
}

export interface IFormData {
  dailyCalories: number;
  dailyProtein: number;
  dailyFat: number;
  dailyCarbs: number;
  goalType: GoalType;
}

export interface IRecommendations {
  dailyCalories: number;
  dailyProtein: number;
  dailyFat: number;
  dailyCarbs: number;
  goalType: GoalType;
  description: string;
}
