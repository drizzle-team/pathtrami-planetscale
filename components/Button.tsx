import { VariantProps } from '@stitches/react';
import { ButtonHTMLAttributes, FC } from 'react';
import { styled, theme } from '~/stitches.config';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof Root> {
	icon?: React.ReactNode;
}

const Button: FC<Props> = ({ children, icon, ...props }) => {
	return (
		<Root type='button' {...props}>
			{icon && <IconWrapper>{icon}</IconWrapper>}
			{children}
		</Root>
	);
};

export default Button;

const Root = styled('button', {
	unset: 'all',
	display: 'flex',
	flexFlow: 'row nowrap',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: theme.fontSizes.button,
	fontWeight: theme.fontWeights.button,
	borderRadius: theme.sizes.borderRadius,
	border: 0,
	lineHeight: 1,
	padding: '0 15px',
	cursor: 'pointer',
	whiteSpace: 'nowrap',

	variants: {
		size: {
			sm: {
				height: 38,
			},
			md: {
				height: 48,
			},
		},
		noPadding: {
			true: {
				padding: 0,
			},
		},
		noBorder: {
			true: {
				border: 0,
			},
		},
		variant: {
			primary: {
				color: theme.colors.textAlt,
				backgroundColor: theme.colors.bgAlt,
			},
			secondary: {
				color: theme.colors.text,
				backgroundColor: theme.colors.bgButtonSecondary,
			},
			cta: {
				color: theme.colors.textAlt,
				backgroundColor: theme.colors.bgButtonCTA,
			},
		},
	},

	defaultVariants: {
		size: 'md',
		variant: 'primary',
	},
});

const IconWrapper = styled('span', {
	marginRight: 5,
});
