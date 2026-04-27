export const getInitials = (name: string): string =>
 name.trim().split('').slice(0, 2).map(w => w[0]).join('');

export const getAvatarColor = (id: string): string => {
 const colors = ['#EF950A','#1B1B1B','#CA0000','#34BF49','#C47A06'];
 return colors[id.charCodeAt(0) % colors.length];
};
