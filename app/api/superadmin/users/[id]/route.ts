import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const user = await userServices.getUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password before sending response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    // Validate input
    if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Role must be user, admin, or superadmin' },
        { status: 400 }
      );
    }

    // Prevent a superadmin from changing their own role to avoid losing access
    if (decoded.userId === params.id && decoded.role === 'superadmin' && role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Super admins cannot change their own role' },
        { status: 400 }
      );
    }

    const user = await userServices.updateUserRole(params.id, role);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password before sending response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'User role updated successfully',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    // Prevent a superadmin from deleting themselves
    if (decoded.userId === params.id) {
      return NextResponse.json(
        { error: 'Super admins cannot delete themselves' },
        { status: 400 }
      );
    }

    const user = await userServices.getUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If deleting a superadmin, ensure there's at least one remaining superadmin
    if (user.role === 'superadmin') {
      const superAdmins = await userServices.getAllUsers();
      const superAdminCount = superAdmins.filter(u => u.role === 'superadmin').length;
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last super admin' },
          { status: 400 }
        );
      }
    }

    const deleted = await userServices.deleteUser(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}