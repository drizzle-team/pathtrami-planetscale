import {
	ChangeEventHandler,
	FC,
	FocusEventHandler,
	FormEventHandler,
	forwardRef,
	InputHTMLAttributes,
	TextareaHTMLAttributes,
	useEffect,
	useState,
} from 'react';
import { flushSync } from 'react-dom';

import { styled, theme } from '~/stitches.config';

interface Props {
	name?: string;
	label: string;
	multiline?: boolean;
	value?: string;
	defaultValue?: string;
	onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	className?: string;
	onFocus?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	readOnly?: boolean;
	placeholder?: string;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
	({ label, multiline, className, ...props }, ref) => {
		const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(
			null,
		);
		const [textareaHeight, setTextareaHeight] = useState<number | string>(
			0,
		);

		const setInput = (el: HTMLInputElement) => {
			if (typeof ref === 'function') {
				ref(el);
			} else if (ref) {
				ref.current = el;
			}
		};

		useEffect(() => {
			if (multiline) {
				if (typeof ref === 'function') {
					ref(textarea);
				} else if (ref) {
					ref.current = textarea;
				}
			}

			if (textarea) {
				setTextareaHeight(textarea.scrollHeight);
			}
		}, [multiline, ref, textarea]);

		const handleChange: ChangeEventHandler<
			HTMLInputElement | HTMLTextAreaElement
		> = (e) => {
			props.onChange?.(e);

			if (!textarea) return;

			flushSync(() => {
				setTextareaHeight('auto');
			});
			setTextareaHeight(textarea.scrollHeight);
		};

		return (
			<Root className={className}>
				{!!label && <label>{label}</label>}
				{multiline ? (
					<textarea
						rows={1}
						ref={setTextarea}
						style={{ height: textareaHeight }}
						{...props}
						onChange={handleChange}
					/>
				) : (
					<input
						ref={setInput}
						type='text'
						{...props}
						onChange={handleChange}
					/>
				)}
			</Root>
		);
	},
);

Input.displayName = 'Input';

export default Input;

const Root = styled('div', {
	display: 'flex',
	flexFlow: 'column nowrap',

	label: {
		fontSize: 13,
		color: theme.colors.inputLabel,
	},

	'input, textarea': {
		unset: 'all',
		border: 0,
		outline: 'none',
		borderBottom: `1px solid ${theme.colors.inputBorder}`,
		marginTop: 4,
		background: 'transparent',
		color: theme.colors.text,
		paddingBottom: 2,
		lineHeight: theme.sizes.lineHeight,
		overflowY: 'hidden',
		height: 28,
		resize: 'none',
		transition: `border ${theme.transitions.duration}`,

		'&:focus': {
			borderBottom: `1px solid ${theme.colors.bgButtonCTA}`,
		},
	},
});
