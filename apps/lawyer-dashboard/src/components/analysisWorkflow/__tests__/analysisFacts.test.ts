import { describe, expect, it } from 'vitest';
import { parseCaseFacts } from '../analysisFacts';

describe('parseCaseFacts', () => {
 it('does not split decimal property measurements into separate facts', () => {
  const facts = [
   'بموجب عقد بيع ابتدائي مؤرخ في 2022/12/21 اشترى الطالب حصة عقارية.',
   '6.04 سهم بالعقار الكائن في 8 شارع القائممقام أحمد عبد العزيز. حدود العقار هي: القبلي الشرقي: العقار 3 شارع عبد القادر رجب مكون من ثلاثة أضلاع؛ الأول 2.72 مترًا، والثاني 0.33 مترًا، والثالث 5.18 مترًا).',
   'القبلي الغربي: بعضه العقار 18 مكرر وشارع عبد القادر رجب باشا وتمامه شارع القائممقام أحمد عبد العزيز بطول 5.00 مترًا.',
  ].join(' ');

  expect(parseCaseFacts(facts)).toEqual([facts]);
 });

 it('keeps explicit numbered facts separate without splitting decimals inside them', () => {
  const facts = '1- وقع العقد بين الطرفين وتضمن حصة مقدارها 6.04 سهم.\n\n2- لم يتم نقل الملكية رغم سداد مقدم الثمن ومساحة الحد 2.72 مترًا.';

  expect(parseCaseFacts(facts)).toEqual([
   '1- وقع العقد بين الطرفين وتضمن حصة مقدارها 6.04 سهم.',
   '2- لم يتم نقل الملكية رغم سداد مقدم الثمن ومساحة الحد 2.72 مترًا.',
  ]);
 });

 it('merges measurement fragments that were already separated by blank lines', () => {
  const facts = [
   'حدود العقار هي: القبلي الشرقي مكون من ثلاثة أضلاع؛ الأول',
   '2.72 مترًا، والثاني',
   '0.33 مترًا، والثالث',
   '5.18 مترًا).',
  ].join('\n\n');

  expect(parseCaseFacts(facts)).toEqual([
   'حدود العقار هي: القبلي الشرقي مكون من ثلاثة أضلاع؛ الأول 2.72 مترًا، والثاني 0.33 مترًا، والثالث 5.18 مترًا).',
  ]);
 });

 it('preserves manually separated unnumbered facts', () => {
  const facts = 'وقع عقد البيع الابتدائي بين الطرفين وتم تحديد المبيع.\n\nامتنع البائع عن تنفيذ التزامه بنقل الملكية رغم الإنذار.';

  expect(parseCaseFacts(facts)).toEqual([
   'وقع عقد البيع الابتدائي بين الطرفين وتم تحديد المبيع.',
   'امتنع البائع عن تنفيذ التزامه بنقل الملكية رغم الإنذار.',
  ]);
 });

 it('keeps clarification answers appended to one fact instead of splitting each question', () => {
  const facts = 'وقع عقد البيع الابتدائي بين الطرفين وتم تحديد المبيع.\nتوضيحات إضافية من المحامي: سؤال: هل تم سداد الثمن؟ | الإجابة: نعم ؛ سؤال: هل تم الإنذار؟ | الإجابة: نعم';

  expect(parseCaseFacts(facts)).toEqual([
   'وقع عقد البيع الابتدائي بين الطرفين وتم تحديد المبيع. توضيحات إضافية من المحامي: سؤال: هل تم سداد الثمن؟ | الإجابة: نعم ؛ سؤال: هل تم الإنذار؟ | الإجابة: نعم',
  ]);
 });
});
