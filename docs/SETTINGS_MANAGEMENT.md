# Settings Management System

## Overview
The Settings Management System provides comprehensive control over system configuration, user access, and email communication templates. This system is designed to give administrators granular control over who can access what features and how the system communicates with users.

## Features

### 🔐 User Management
- **Role-Based Access Control (RBAC)**: Define user roles with specific permissions
- **Permission Management**: Granular control over feature access
- **User Status Control**: Activate/deactivate users as needed
- **User Invitations**: Secure invitation system for new users

### 📧 Email Template Management
- **Template Categories**: Reminder, Notification, Announcement, Custom
- **Variable Support**: Dynamic content using `{{variable}}` syntax
- **Template Validation**: Ensures variables are properly defined
- **Active/Inactive Status**: Control which templates are available

### ⚙️ System Settings
- **Configuration Management**: Centralized system configuration
- **Category Organization**: Group settings by purpose (General, Email, Security, etc.)
- **Editable Controls**: Some settings are read-only, others editable
- **Sensitive Data Protection**: Secure handling of passwords and API keys

### 👥 User Invitations
- **Secure Invitation Process**: Time-limited invitations with tokens
- **Role Assignment**: Assign roles and permissions during invitation
- **Expiration Management**: Automatic expiration of unused invitations
- **Acceptance Tracking**: Monitor invitation acceptance status

## User Roles

### Super Admin
- Full system access
- Can manage all users and settings
- Cannot be restricted by permissions

### Admin
- High-level system access
- Can manage most users and settings
- Limited only by specific permission restrictions

### Manager
- Operational level access
- Can manage families, members, and basic settings
- Restricted access to system-level functions

### User
- Standard user access
- Basic family and member management
- Limited to assigned permissions

### Viewer
- Read-only access
- Can view but not modify data
- Minimal system interaction

## Permissions

### Family Management
- `view_families` - View family information
- `create_families` - Create new families
- `edit_families` - Modify existing families
- `delete_families` - Remove families

### Member Management
- `view_members` - View member information
- `create_members` - Add new members
- `edit_members` - Modify existing members
- `delete_members` - Remove members

### Financial Management
- `view_financial` - View financial data
- `create_pledges` - Create new pledges
- `edit_pledges` - Modify existing pledges
- `delete_pledges` - Remove pledges
- `view_donations` - View donation information

### Settings Management
- `view_settings` - Access settings pages
- `manage_users` - Manage system users
- `manage_email_templates` - Manage email templates
- `manage_system_settings` - Modify system configuration

### Reports and Analytics
- `view_reports` - Access reporting features
- `export_data` - Export system data

### Email Management
- `send_emails` - Send emails using templates
- `view_email_history` - View email sending history

## Email Template System

### Template Variables
Email templates support dynamic content using variable substitution:

```html
Dear {{familyName}},

This is a reminder that your annual pledge of {{pledgeAmount}} is due on {{dueDate}}.

Best regards,
{{synagogueName}}
```

### Available Variable Categories

#### Family Variables
- `{{familyName}}` - Family's last name
- `{{hebrewFamilyName}}` - Family's Hebrew name
- `{{primaryEmail}}` - Family's primary email
- `{{phone}}` - Family's phone number
- `{{address}}` - Family's address

#### Member Variables
- `{{firstName}}` - Member's first name
- `{{lastName}}` - Member's last name
- `{{fullName}}` - Member's full name
- `{{email}}` - Member's email
- `{{relationshipInHouse}}` - Member's relationship

#### System Variables
- `{{synagogueName}}` - Synagogue name
- `{{currentDate}}` - Current date
- `{{currentYear}}` - Current year
- `{{adminEmail}}` - Admin contact email

### Template Categories

#### Reminder Templates
- **Purpose**: Remind users of upcoming events or obligations
- **Examples**: Pledge due dates, event reminders, membership renewals
- **Variables**: Dates, amounts, family information

#### Notification Templates
- **Purpose**: Inform users of system events or changes
- **Examples**: Account updates, password changes, system maintenance
- **Variables**: User information, system details

#### Announcement Templates
- **Purpose**: Broadcast information to multiple users
- **Examples**: Community events, policy changes, general announcements
- **Variables**: Event details, dates, locations

#### Custom Templates
- **Purpose**: Specialized communication needs
- **Examples**: Personalized messages, special events, unique requirements
- **Variables**: Any combination of available variables

## System Settings

### General Settings
- Application configuration
- Default values
- System behavior settings

### Email Settings
- SMTP configuration
- Email sender information
- Template defaults

### Notification Settings
- Push notification preferences
- Alert thresholds
- Communication preferences

### Security Settings
- Password policies
- Session timeouts
- Access restrictions

### Custom Settings
- Application-specific configuration
- Third-party integrations
- Feature flags

## User Invitation Process

### 1. Invitation Creation
1. Admin creates invitation with user details
2. System generates secure invitation token
3. Invitation email sent to user
4. Invitation stored with expiration date

### 2. Invitation Acceptance
1. User clicks invitation link
2. System validates token and expiration
3. User completes registration form
4. Account created with assigned role and permissions

### 3. Invitation Management
- Track invitation status
- Resend expired invitations
- Cancel pending invitations
- Monitor acceptance rates

## Security Features

### Authentication
- JWT-based authentication
- Secure password hashing
- Session management

### Authorization
- Role-based access control
- Permission-based restrictions
- Resource-level security

### Data Protection
- Sensitive data encryption
- Audit logging
- Access monitoring

## Best Practices

### User Management
- Assign minimal necessary permissions
- Regular permission reviews
- Immediate deactivation of inactive users

### Email Templates
- Use clear, professional language
- Test templates before deployment
- Regular template updates

### System Settings
- Document all configuration changes
- Test settings in development first
- Regular backup of configuration

### Security
- Regular security audits
- Monitor access patterns
- Keep permissions current

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Email Templates
- `GET /api/email-templates` - Get all templates
- `POST /api/email-templates` - Create template
- `PUT /api/email-templates/:id` - Update template
- `DELETE /api/email-templates/:id` - Delete template

### System Settings
- `GET /api/system-settings` - Get all settings
- `POST /api/system-settings` - Create setting
- `PUT /api/system-settings/:id` - Update setting
- `DELETE /api/system-settings/:id` - Delete setting

### User Invitations
- `GET /api/user-invitations` - Get all invitations
- `POST /api/user-invitations` - Create invitation
- `POST /api/user-invitations/:id/accept` - Accept invitation

## Future Enhancements

### Planned Features
- **Audit Logging**: Track all system changes
- **Advanced Permissions**: Time-based and conditional permissions
- **Template Versioning**: Track template changes over time
- **Bulk Operations**: Manage multiple users/settings at once
- **API Rate Limiting**: Prevent abuse of system resources

### Integration Possibilities
- **LDAP/Active Directory**: Enterprise user management
- **SSO Integration**: Single sign-on capabilities
- **Multi-factor Authentication**: Enhanced security
- **Mobile App Support**: Mobile device management

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check user role and permissions
2. **Template Errors**: Validate variable syntax
3. **Invitation Expired**: Resend invitation or extend expiration
4. **Settings Not Saving**: Verify user has edit permissions

### Support
For technical support or questions about the settings management system, contact your system administrator or refer to the system documentation.
